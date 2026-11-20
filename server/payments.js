import crypto from "node:crypto";
import Razorpay from "razorpay";
import { quoteCart } from "../src/data/checkout.js";
import { prisma, toOrder } from "./lib.js";

export const razorpayReady = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

const razorpay = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

export const signPayment = (orderId, paymentId) =>
  crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");

export function verifyWebhook(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

async function couponBook() {
  const rows = await prisma.coupon.findMany();
  return Object.fromEntries(rows.map((row) => [row.code, row]));
}

export async function quoteForCart(cart) {
  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return quoteCart({
    subtotal,
    couponCode: cart.coupon,
    methodId: cart.method,
    couponBook: await couponBook(),
  });
}

export async function createRazorpayOrder(amount, receipt) {
  return razorpay().orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt,
  });
}

export async function fulfillPayment({ razorpayOrderId, paymentId }) {
  const order = await prisma.order.findFirst({
    where: { razorpayOrderId },
    include: { items: true },
  });
  if (!order) return null;
  if (order.status === "paid") return order;
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "paid", paymentId },
    include: { items: true },
  });
  const cart = await prisma.cart.findUnique({ where: { userId: order.userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.update({ where: { id: cart.id }, data: { coupon: "", method: "studio" } });
  }
  return updated;
}

export const paidOrder = (row) => ({ ...toOrder(row), status: row.status, paymentId: row.paymentId });
