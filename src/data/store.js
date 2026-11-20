import { catalogProducts } from "./catalog";

export {
  catalogProducts as products,
  priceBounds,
  sortOptions,
  searchProducts,
  filterCatalog,
  sortCatalog,
} from "./catalog";

export const brand = {
  name: "Solenne",
  tagline: "The art of giving, considered.",
  email: "hello@solenne.gift",
  phone: "+1 (212) 555-0148",
  address: "18 Mercer Street, New York, NY",
};

export const navLinks = [
  { label: "Shop", to: "/shop" },
  { label: "Occasions", to: "/occasions" },
  { label: "Our Story", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export const categories = [
  {
    id: "candles",
    name: "Scented Rituals",
    blurb: "Hand-poured candles & incense",
    image:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80",
    count: 24,
  },
  {
    id: "florals",
    name: "Preserved Florals",
    blurb: "Bouquets that linger",
    image:
      "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=900&q=80",
    count: 18,
  },
  {
    id: "table",
    name: "The Table",
    blurb: "Linens, glass & serving",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
    count: 31,
  },
  {
    id: "stationery",
    name: "Written Words",
    blurb: "Paper, pens & journals",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
    count: 16,
  },
  {
    id: "home",
    name: "Quiet Home",
    blurb: "Objects for slow rooms",
    image:
      "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=900&q=80",
    count: 22,
  },
  {
    id: "gourmet",
    name: "Pantry Gifts",
    blurb: "Honey, tea & chocolate",
    image:
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=900&q=80",
    count: 27,
  },
];

export const occasions = [
  {
    id: "wedding",
    name: "Weddings",
    season: "For the couple",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "birthday",
    name: "Birthdays",
    season: "A little ceremony",
    image:
      "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "newborn",
    name: "New Arrivals",
    season: "Welcome home",
    image:
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "host",
    name: "Host Gifts",
    season: "Arrive with grace",
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "sympathy",
    name: "With Care",
    season: "Gentle gestures",
    image:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "holiday",
    name: "The Holidays",
    season: "Winter tables",
    image:
      "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1000&q=80",
  },
];

export const reasons = [
  {
    title: "Wrapped by hand",
    text: "Every order leaves our studio in cotton paper, linen ribbon, and a wax seal. No plastic, no filler.",
  },
  {
    title: "Written for them",
    text: "Add a note in your own words. We transcribe it onto thick card, in ink, never printed.",
  },
  {
    title: "Chosen slowly",
    text: "A small edit of objects we would give ourselves — makers we know, materials that last.",
  },
  {
    title: "Sent with care",
    text: "Complimentary gift notes, scheduled delivery, and a quiet unboxing on the day that matters.",
  },
];

export const testimonials = [
  {
    quote:
      "It arrived looking like something from a novel. My sister still has the ribbon on her mirror.",
    name: "Amelia Hart",
    place: "Brooklyn",
    gift: "Blush Peony Keepsake",
  },
  {
    quote:
      "I stopped buying last-minute gifts. Solenne makes the gesture feel like it was thought about for weeks.",
    name: "Jonas Ellery",
    place: "London",
    gift: "Evening Tea Chest",
  },
  {
    quote:
      "The handwritten card undid me. It was my words, but it looked like it belonged to the gift.",
    name: "Priya Menon",
    place: "Chicago",
    gift: "Silk-Bound Journal",
  },
];

export const gallery = [
  {
    src: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=80",
    alt: "Linen-wrapped gifts stacked on a marble table",
  },
  {
    src: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=800&q=80",
    alt: "A blush bouquet on ivory linen",
  },
  {
    src: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
    alt: "Lit candles in ceramic vessels",
  },
  {
    src: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80",
    alt: "A newborn gift laid on a soft blanket",
  },
  {
    src: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
    alt: "Hands tying a ribbon around a present",
  },
  {
    src: "https://images.unsplash.com/photo-1478144592103-25e218a04891?auto=format&fit=crop&w=800&q=80",
    alt: "A festive table set with candles and glass",
  },
];

export const formatPrice = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const getProduct = (id) => catalogProducts.find((product) => product.id === id);

export const getCategory = (id) => categories.find((category) => category.id === id);

export const getOccasion = (id) => occasions.find((occasion) => occasion.id === id);
