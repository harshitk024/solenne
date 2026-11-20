import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./db.js";

export { prisma };
const SECRET = process.env.JWT_SECRET || "solenne-dev-secret";
const WEEK = 60 * 60 * 24 * 7;

export const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, SECRET, { expiresIn: WEEK });

export const readToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
};

export const hashPassword = (password) => bcrypt.hash(password, 10);
export const checkPassword = (password, hash) => bcrypt.compare(password, hash);

export const toProduct = (row) => ({
  id: row.id,
  name: row.name,
  price: row.price,
  compareAt: row.compareAt,
  category: row.category,
  occasions: JSON.parse(row.occasions),
  badge: row.badge,
  bestseller: row.bestseller,
  isNew: row.isNew,
  rating: row.rating,
  reviews: row.reviews,
  stock: row.stock,
  sku: row.sku,
  materials: row.materials,
  made: row.made,
  short: row.short,
  description: row.description,
  story: row.story,
  care: row.care,
  details: JSON.parse(row.details),
  images: JSON.parse(row.images),
  image: JSON.parse(row.images)[0],
  hover: JSON.parse(row.images)[1] || JSON.parse(row.images)[0],
  reviewsList: JSON.parse(row.reviewNotes),
});

export const toCartItem = (row) => ({
  id: row.product.id,
  name: row.product.name,
  price: row.product.price,
  image: JSON.parse(row.product.images)[0],
  quantity: row.quantity,
  note: row.note,
});

export const toOrder = (row) => ({
  id: row.id,
  placedAt: row.placedAt,
  email: row.email,
  recipient: row.recipient,
  address: {
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    region: row.region,
    postal: row.postal,
    country: row.country,
  },
  note: row.note,
  method: { id: row.methodId, label: row.methodLabel, detail: row.methodDetail },
  coupon: row.coupon,
  subtotal: row.subtotal,
  discount: row.discount,
  shipping: row.shipping,
  total: row.total,
  status: row.status,
  paymentId: row.paymentId,
  items: row.items.map((item) => ({
    id: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    note: item.note,
    image: item.image,
  })),
});

export const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});

export async function requireUser(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies?.token;
  const payload = token ? readToken(token) : null;
  if (!payload) return res.status(401).json({ error: "Please sign in to continue." });
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) return res.status(401).json({ error: "Please sign in to continue." });
  req.user = user;
  next();
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) return res.status(403).json({ error: "You do not have access to that." });
    next();
  };
}
