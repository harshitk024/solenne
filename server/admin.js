import { z } from "zod";
import { prisma, toProduct, toOrder, publicUser, hashPassword, requireUser, requireRole } from "./lib.js";

const admin = [requireUser, requireRole("admin")];

const productSchema = z.object({
  id: z.string().min(2),
  name: z.string().min(2),
  price: z.coerce.number().int().positive(),
  compareAt: z.coerce.number().int().positive().nullable().optional(),
  category: z.string().min(2),
  occasions: z.array(z.string()).default([]),
  badge: z.string().optional().nullable(),
  bestseller: z.coerce.boolean().default(false),
  isNew: z.coerce.boolean().default(false),
  rating: z.coerce.number().min(0).max(5).default(5),
  reviews: z.coerce.number().int().default(0),
  stock: z.coerce.number().int().min(0),
  sku: z.string().min(2),
  materials: z.string().default(""),
  made: z.string().default(""),
  short: z.string().min(2),
  description: z.string().min(2),
  story: z.string().default(""),
  care: z.string().default(""),
  details: z.array(z.string()).default([]),
  images: z.array(z.string().url()).min(1),
});

const toRow = (input) => ({
  id: input.id,
  name: input.name,
  price: input.price,
  compareAt: input.compareAt || null,
  category: input.category,
  occasions: JSON.stringify(input.occasions),
  badge: input.badge || null,
  bestseller: input.bestseller,
  isNew: input.isNew,
  rating: input.rating,
  reviews: input.reviews,
  stock: input.stock,
  sku: input.sku,
  materials: input.materials,
  made: input.made,
  short: input.short,
  description: input.description,
  story: input.story,
  care: input.care,
  details: JSON.stringify(input.details),
  images: JSON.stringify(input.images),
  reviewNotes: JSON.stringify([]),
});

export function registerAdmin(app) {
  app.use("/api/admin", ...admin);

  app.get("/api/admin/stats", async (_req, res) => {
    const [products, orders, customers, lowStock] = await Promise.all([
      prisma.product.findMany(),
      prisma.order.findMany({ include: { items: true } }),
      prisma.user.count({ where: { role: "customer" } }),
      prisma.product.count({ where: { stock: { lte: 5 } } }),
    ]);
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    const units = orders.reduce((sum, order) => sum + order.items.reduce((inner, item) => inner + item.quantity, 0), 0);
    const byCategory = {};
    products.forEach((product) => {
      byCategory[product.category] = (byCategory[product.category] || 0) + 1;
    });
    res.json({
      revenue,
      orders: orders.length,
      customers,
      products: products.length,
      units,
      lowStock,
      inventoryValue: products.reduce((sum, product) => sum + product.price * product.stock, 0),
      byCategory,
      recent: orders
        .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt))
        .slice(0, 5)
        .map(toOrder),
    });
  });

  app.get("/api/admin/products", async (_req, res) => {
    const rows = await prisma.product.findMany({ orderBy: { name: "asc" } });
    res.json(rows.map(toProduct));
  });

  app.post("/api/admin/products", async (req, res) => {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "The product details are incomplete." });
    const created = await prisma.product.create({ data: toRow(parsed.data) });
    res.status(201).json(toProduct(created));
  });

  app.put("/api/admin/products/:id", async (req, res) => {
    const parsed = productSchema.safeParse({ ...req.body, id: req.params.id });
    if (!parsed.success) return res.status(400).json({ error: "The product details are incomplete." });
    const updated = await prisma.product.update({ where: { id: req.params.id }, data: toRow(parsed.data) });
    res.json(toProduct(updated));
  });

  app.patch("/api/admin/products/:id/stock", async (req, res) => {
    const stock = Number(req.body.stock);
    if (!Number.isInteger(stock) || stock < 0) return res.status(400).json({ error: "Stock must be a whole number." });
    const updated = await prisma.product.update({ where: { id: req.params.id }, data: { stock } });
    res.json(toProduct(updated));
  });

  app.delete("/api/admin/products/:id", async (req, res) => {
    const [cartUse, orderUse] = await Promise.all([
      prisma.cartItem.count({ where: { productId: req.params.id } }),
      prisma.orderItem.count({ where: { productId: req.params.id } }),
    ]);
    if (cartUse || orderUse) return res.status(409).json({ error: "This piece is in a bag or an order, so it cannot be removed. Set stock to zero instead." });
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  });

  app.get("/api/admin/orders", async (_req, res) => {
    const rows = await prisma.order.findMany({ include: { items: true, user: true }, orderBy: { placedAt: "desc" } });
    res.json(rows.map((row) => ({ ...toOrder(row), customer: publicUser(row.user) })));
  });

  app.get("/api/admin/customers", async (_req, res) => {
    const users = await prisma.user.findMany({
      include: { orders: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(
      users.map((user) => ({
        ...publicUser(user),
        createdAt: user.createdAt,
        orders: user.orders.length,
        spent: user.orders.reduce((sum, order) => sum + order.total, 0),
      })),
    );
  });

  app.patch("/api/admin/customers/:id", async (req, res) => {
    if (!["customer", "admin"].includes(req.body.role)) return res.status(400).json({ error: "Role must be customer or admin." });
    if (req.params.id === req.user.id && req.body.role !== "admin") {
      return res.status(400).json({ error: "You cannot remove your own studio access." });
    }
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { role: req.body.role } });
    res.json(publicUser(user));
  });

  app.post("/api/admin/customers", async (req, res) => {
    const parsed = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
      role: z.enum(["customer", "admin"]).default("customer"),
    }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Name, email, and an 8-character password are required." });
    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "An account already uses that email." });
    const user = await prisma.user.create({
      data: {
        ...parsed.data,
        email,
        passwordHash: await hashPassword(parsed.data.password),
        cart: { create: {} },
      },
    });
    res.status(201).json(publicUser(user));
  });

  app.get("/api/admin/categories", async (_req, res) => {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.product.findMany({ select: { category: true } }),
    ]);
    res.json(
      categories.map((category) => ({
        ...category,
        count: products.filter((product) => product.category === category.id).length,
      })),
    );
  });

  app.post("/api/admin/categories", async (req, res) => {
    const parsed = z.object({
      id: z.string().min(2),
      name: z.string().min(2),
      blurb: z.string().min(2),
      image: z.string().url(),
    }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "A category needs an id, name, blurb, and image." });
    const created = await prisma.category.create({ data: parsed.data });
    res.status(201).json(created);
  });

  app.put("/api/admin/categories/:id", async (req, res) => {
    const updated = await prisma.category.update({
      where: { id: req.params.id },
      data: { name: req.body.name, blurb: req.body.blurb, image: req.body.image },
    });
    res.json(updated);
  });

  app.delete("/api/admin/categories/:id", async (req, res) => {
    const used = await prisma.product.count({ where: { category: req.params.id } });
    if (used) return res.status(409).json({ error: "Move the pieces in this category before removing it." });
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  });

  app.get("/api/admin/coupons", async (_req, res) => {
    res.json(await prisma.coupon.findMany({ orderBy: { code: "asc" } }));
  });

  app.post("/api/admin/coupons", async (req, res) => {
    const parsed = z.object({
      code: z.string().min(3),
      label: z.string().min(2),
      type: z.enum(["percent", "fixed", "shipping"]),
      amount: z.coerce.number().int().min(0).default(0),
      active: z.coerce.boolean().default(true),
    }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "The coupon details are incomplete." });
    const created = await prisma.coupon.create({
      data: { ...parsed.data, code: parsed.data.code.trim().toUpperCase() },
    });
    res.status(201).json(created);
  });

  app.put("/api/admin/coupons/:code", async (req, res) => {
    const updated = await prisma.coupon.update({
      where: { code: req.params.code },
      data: {
        label: req.body.label,
        type: req.body.type,
        amount: Number(req.body.amount) || 0,
        active: Boolean(req.body.active),
      },
    });
    res.json(updated);
  });

  app.delete("/api/admin/coupons/:code", async (req, res) => {
    await prisma.coupon.delete({ where: { code: req.params.code } });
    res.json({ ok: true });
  });
}
