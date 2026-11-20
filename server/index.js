import "dotenv/config";
import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { z } from "zod";
import { shippingMethods, createOrderNumber } from "../src/data/checkout.js";
import {
  razorpayReady,
  signPayment,
  verifyWebhook,
  quoteForCart,
  createRazorpayOrder,
  fulfillPayment,
  paidOrder,
} from "./payments.js";
import {
  prisma,
  toProduct,
  toCartItem,
  toOrder,
  publicUser,
  signToken,
  hashPassword,
  checkPassword,
  requireUser,
} from "./lib.js";
import { registerAdmin } from "./admin.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.get("x-razorpay-signature");
  if (!verifyWebhook(req.body, signature)) return res.status(400).json({ error: "Invalid webhook signature." });
  const event = JSON.parse(req.body.toString());
  const payment = event?.payload?.payment?.entity;
  if (event.event === "payment.captured" && payment?.order_id) {
    await fulfillPayment({ razorpayOrderId: payment.order_id, paymentId: payment.id });
  }
  res.json({ ok: true });
});
app.use(express.json());
app.use(cookieParser());

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).optional(),
});

async function couponBook() {
  const rows = await prisma.coupon.findMany();
  if (!rows.length) return undefined;
  return Object.fromEntries(rows.map((row) => [row.code, { label: row.label, type: row.type, amount: row.amount, active: row.active }]));
}

async function cartFor(userId) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: { items: { include: { product: true } } },
  });
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/coupons", async (_req, res) => {
  const rows = await prisma.coupon.findMany({ where: { active: true }, select: { code: true, label: true, type: true, amount: true, active: true } });
  res.json(rows);
});

app.get("/api/products", async (req, res) => {
  const { category, q } = req.query;
  const rows = await prisma.product.findMany({
    where: category ? { category: String(category) } : undefined,
    orderBy: { name: "asc" },
  });
  const products = rows.map(toProduct).filter((product) => {
    if (!q) return true;
    const term = String(q).toLowerCase();
    return `${product.name} ${product.short} ${product.description}`.toLowerCase().includes(term);
  });
  res.json(products);
});

app.get("/api/products/:id", async (req, res) => {
  const row = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ error: "This piece has left the table." });
  res.json(toProduct(row));
});

app.post("/api/auth/register", async (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success || !parsed.data.name) {
    return res.status(400).json({ error: "Name, a valid email, and a password of 8 characters are required." });
  }
  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "An account already uses that email." });
  const user = await prisma.user.create({
    data: { email, name: parsed.data.name, passwordHash: await hashPassword(parsed.data.password) },
  });
  await prisma.cart.create({ data: { userId: user.id } });
  const token = signToken(user);
  res.cookie("token", token, { httpOnly: true, sameSite: "lax", maxAge: 7 * 864e5 });
  res.status(201).json({ user: publicUser(user), token });
});

app.post("/api/auth/login", async (req, res) => {
  const parsed = authSchema.omit({ name: true }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Email and password are required." });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !(await checkPassword(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ error: "Those details do not match an account." });
  }
  const token = signToken(user);
  res.cookie("token", token, { httpOnly: true, sameSite: "lax", maxAge: 7 * 864e5 });
  res.json({ user: publicUser(user), token });
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

app.get("/api/auth/me", requireUser, (req, res) => res.json({ user: publicUser(req.user) }));

app.get("/api/cart", requireUser, async (req, res) => {
  const cart = await cartFor(req.user.id);
  res.json({ items: cart.items.map(toCartItem), coupon: cart.coupon, method: cart.method });
});

app.post("/api/cart/items", requireUser, async (req, res) => {
  const { productId, quantity = 1, note = "" } = req.body;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ error: "That piece is no longer available." });
  const cart = await cartFor(req.user.id);
  const existing = cart.items.find((item) => item.productId === productId);
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + Number(quantity), note: note || existing.note },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity: Number(quantity), note },
    });
  }
  const next = await cartFor(req.user.id);
  res.json({ items: next.items.map(toCartItem), coupon: next.coupon, method: next.method });
});

app.patch("/api/cart/items/:productId", requireUser, async (req, res) => {
  const cart = await cartFor(req.user.id);
  const item = cart.items.find((entry) => entry.productId === req.params.productId);
  if (!item) return res.status(404).json({ error: "That piece is not in the bag." });
  const quantity = req.body.quantity === undefined ? item.quantity : Number(req.body.quantity);
  if (quantity < 1) await prisma.cartItem.delete({ where: { id: item.id } });
  else {
    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity, note: req.body.note === undefined ? item.note : req.body.note },
    });
  }
  const next = await cartFor(req.user.id);
  res.json({ items: next.items.map(toCartItem), coupon: next.coupon, method: next.method });
});

app.delete("/api/cart/items/:productId", requireUser, async (req, res) => {
  const cart = await cartFor(req.user.id);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId: req.params.productId } });
  const next = await cartFor(req.user.id);
  res.json({ items: next.items.map(toCartItem), coupon: next.coupon, method: next.method });
});

app.post("/api/cart/coupon", requireUser, async (req, res) => {
  const cart = await cartFor(req.user.id);
  const preview = await quoteForCart({ ...cart, coupon: req.body.code || "" });
  const quote = preview;
  if (!quote.coupon) return res.status(400).json({ error: "That code is not in the book." });
  await prisma.cart.update({ where: { id: cart.id }, data: { coupon: quote.code } });
  res.json({ coupon: quote.code, label: quote.coupon.label });
});

app.delete("/api/cart/coupon", requireUser, async (req, res) => {
  const cart = await cartFor(req.user.id);
  await prisma.cart.update({ where: { id: cart.id }, data: { coupon: "" } });
  res.json({ coupon: "" });
});

app.patch("/api/cart", requireUser, async (req, res) => {
  const cart = await cartFor(req.user.id);
  const method = shippingMethods.some((item) => item.id === req.body.method) ? req.body.method : cart.method;
  await prisma.cart.update({ where: { id: cart.id }, data: { method } });
  res.json({ method });
});

app.delete("/api/cart", requireUser, async (req, res) => {
  const cart = await cartFor(req.user.id);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  await prisma.cart.update({ where: { id: cart.id }, data: { coupon: "", method: "studio" } });
  res.json({ items: [], coupon: "", method: "studio" });
});

const orderSchema = z.object({
  email: z.string().email(),
  recipient: z.string().min(2),
  address: z.object({
    phone: z.string().min(5),
    line1: z.string().min(3),
    line2: z.string().optional().default(""),
    city: z.string().min(2),
    region: z.string().min(2),
    postal: z.string().min(3),
    country: z.string().min(2),
  }),
  note: z.string().optional().default(""),
});

app.post("/api/payments/order", requireUser, async (req, res) => {
  if (!razorpayReady()) return res.status(503).json({ error: "Razorpay is not configured on the server." });
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "The shipping details are incomplete." });
  const cart = await cartFor(req.user.id);
  if (!cart.items.length) return res.status(400).json({ error: "Your bag is empty." });
  const quote = await quoteForCart(cart);
  if (quote.total < 1) return res.status(400).json({ error: "The order total must be at least ₹1." });
  const id = createOrderNumber();
  const gateway = await createRazorpayOrder(quote.total, id);
  const order = await prisma.order.create({
    data: {
      id,
      userId: req.user.id,
      email: parsed.data.email,
      recipient: parsed.data.recipient,
      phone: parsed.data.address.phone,
      line1: parsed.data.address.line1,
      line2: parsed.data.address.line2,
      city: parsed.data.address.city,
      region: parsed.data.address.region,
      postal: parsed.data.address.postal,
      country: parsed.data.address.country,
      note: parsed.data.note,
      methodId: quote.method.id,
      methodLabel: quote.method.label,
      methodDetail: quote.method.detail,
      coupon: quote.code,
      subtotal: quote.subtotal,
      discount: quote.discount,
      shipping: quote.shipping,
      total: quote.total,
      status: "pending",
      razorpayOrderId: gateway.id,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          note: item.note,
          image: JSON.parse(item.product.images)[0],
        })),
      },
    },
  });
  res.status(201).json({
    key: process.env.RAZORPAY_KEY_ID,
    orderId: order.id,
    razorpayOrderId: gateway.id,
    amount: gateway.amount,
    currency: gateway.currency,
    name: "Solenne",
    description: `Gift order ${order.id}`,
  });
});

app.post("/api/payments/verify", requireUser, async (req, res) => {
  const { razorpay_order_id: razorpayOrderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
  if (!razorpayOrderId || !paymentId || !signature) return res.status(400).json({ error: "Payment details are missing." });
  const expected = signPayment(razorpayOrderId, paymentId);
  const valid = expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  if (!valid) return res.status(400).json({ error: "Payment could not be verified." });
  const order = await prisma.order.findFirst({ where: { razorpayOrderId, userId: req.user.id } });
  if (!order) return res.status(404).json({ error: "We cannot find that payment." });
  const paid = await fulfillPayment({ razorpayOrderId, paymentId });
  res.json(paidOrder(paid));
});

app.get("/api/payments/config", (_req, res) => {
  res.json({ enabled: razorpayReady(), currency: "INR" });
});

app.get("/api/orders", requireUser, async (req, res) => {
  const rows = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: true },
    orderBy: { placedAt: "desc" },
  });
  res.json(rows.map(toOrder));
});

app.get("/api/orders/:id", requireUser, async (req, res) => {
  const row = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
  if (!row || (row.userId !== req.user.id && req.user.role !== "admin")) {
    return res.status(404).json({ error: "We cannot find that order." });
  }
  res.json(toOrder(row));
});

registerAdmin(app);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`Solenne API listening on http://localhost:${port}`);
});
