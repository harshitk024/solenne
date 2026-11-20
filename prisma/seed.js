import "dotenv/config";
import bcrypt from "bcryptjs";
import { catalogProducts } from "../src/data/catalog.js";
import { coupons } from "../src/data/checkout.js";
import { prisma } from "../server/db.js";

const rows = catalogProducts.map((product) => ({
  id: product.id,
  name: product.name,
  price: product.price,
  compareAt: product.compareAt,
  category: product.category,
  occasions: JSON.stringify(product.occasions),
  badge: product.badge,
  bestseller: product.bestseller,
  isNew: product.isNew,
  rating: product.rating,
  reviews: product.reviews,
  stock: product.stock,
  sku: product.sku,
  materials: product.materials,
  made: product.made,
  short: product.short,
  description: product.description,
  story: product.story,
  care: product.care,
  details: JSON.stringify(product.details),
  images: JSON.stringify(product.images),
  reviewNotes: JSON.stringify(product.reviewsList || []),
}));

await prisma.orderItem.deleteMany();
await prisma.order.deleteMany();
await prisma.cartItem.deleteMany();
await prisma.cart.deleteMany();
await prisma.user.deleteMany();
await prisma.product.deleteMany();
await prisma.category.deleteMany();
await prisma.coupon.deleteMany();
await prisma.product.createMany({ data: rows });
await prisma.category.createMany({
  data: [
    ["candles", "Scented Rituals", "Hand-poured candles & incense", "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80"],
    ["florals", "Preserved Florals", "Bouquets that linger", "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=900&q=80"],
    ["table", "The Table", "Linens, glass & serving", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80"],
    ["stationery", "Written Words", "Paper, pens & journals", "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80"],
    ["home", "Quiet Home", "Objects for slow rooms", "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=900&q=80"],
    ["gourmet", "Pantry Gifts", "Honey, tea & chocolate", "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=900&q=80"],
  ].map(([id, name, blurb, image]) => ({ id, name, blurb, image })),
});
await prisma.coupon.createMany({
  data: Object.entries(coupons).map(([code, coupon]) => ({
    code,
    label: coupon.label,
    type: coupon.type,
    amount: coupon.amount || 0,
    active: true,
  })),
});

const passwordHash = await bcrypt.hash("solenne-atelier", 10);
await prisma.user.create({
  data: {
    email: "atelier@solenne.gift",
    name: "Studio Atelier",
    passwordHash,
    role: "admin",
    cart: { create: {} },
  },
});

console.log(`Seeded ${rows.length} products and the studio account.`);
await prisma.$disconnect();
