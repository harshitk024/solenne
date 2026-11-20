import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CatalogProvider } from "./context/CatalogContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Occasions from "./pages/Occasions";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Orders";
import Account from "./pages/Account";
import Wishlist from "./pages/Wishlist";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import ProductsAdmin from "./admin/Products";
import Inventory from "./admin/Inventory";
import OrdersAdmin from "./admin/OrdersAdmin";
import Customers from "./admin/Customers";
import CategoriesAdmin from "./admin/Categories";
import CouponsAdmin from "./admin/Coupons";

export default function App() {
  return (
    <AuthProvider>
    <CatalogProvider>
    <CartProvider>
      <WishlistProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<Product />} />
            <Route path="occasions" element={<Occasions />} />
            <Route path="occasions/:id" element={<Occasions />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order/:id" element={<OrderConfirmation />} />
            <Route path="orders" element={<Orders />} />
            <Route path="account" element={<Account />} />
            <Route path="wishlist" element={<Wishlist />} />
          </Route>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="orders" element={<OrdersAdmin />} />
            <Route path="customers" element={<Customers />} />
            <Route path="categories" element={<CategoriesAdmin />} />
            <Route path="coupons" element={<CouponsAdmin />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </WishlistProvider>
    </CartProvider>
    </CatalogProvider>
    </AuthProvider>
  );
}
