# Solenne

Phase 1 of a premium gifting storefront. Customer-facing UI only — no admin, database, authentication, or payments yet.

## Run

```bash
npm install
npm run db:setup
npm run dev:all
```

The storefront is at http://localhost:5173 and the API at http://localhost:4000. Products, accounts, carts, and orders are stored in SQLite through Prisma. If the API is not running, the shop falls back to the sample catalogue.

Studio account: `atelier@solenne.gift` / `solenne-atelier`

The admin desk is at `/admin`. Only accounts with the admin role can open it or call `/api/admin`.

## What is included

- Responsive navigation, search, and bag
- Home: hero, categories, bestsellers, new arrivals, occasions, why us, testimonials, gallery, newsletter, footer
- Shop with category, occasion, and price filters, sort, and search
- Product galleries, gift notes, wishlist, and add to bag
- Product pages with gift notes and add to bag
- Occasion collections, story, contact, and a checkout preview
- Bag, coupons, checkout, and order confirmation persisted in local storage

Sample products live in `src/data/store.js`.
