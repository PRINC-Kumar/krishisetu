import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronRight,
  CircleDollarSign,
  Leaf,
  Menu,
  PackageCheck,
  ShieldCheck,
  Sprout,
  Truck,
  Users,
  X,
} from "lucide-react";
import { listingApi } from "../api/listingApi.js";
import { mandiApi } from "../api/mandiApi.js";
import { orderApi } from "../api/orderApi.js";
import ListingCard from "../components/buyer/ListingCard.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import { useAuth } from "../hooks/useAuth.js";

const categories = [
  { label: "Cereals", icon: "🌾", search: "Wheat" },
  { label: "Pulses", icon: "🌱", search: "" },
  { label: "Oilseeds", icon: "🌻", search: "" },
  { label: "Vegetables", icon: "🥕", search: "" },
  { label: "Fruits", icon: "🍎", search: "" },
  { label: "Spices", icon: "🌶️", search: "" },
];

const trustItems = [
  [BadgeCheck, "Verified Farmers", "Know who grows your produce."],
  [ShieldCheck, "Transparent Listings", "Clear quantity, quality, and price."],
  [PackageCheck, "Secure Payments", "Trade with confidence at every step."],
  [Truck, "Order Tracking", "Follow every order from field to door."],
  [Users, "Dispute Support", "A fair process when help is needed."],
  [BarChart3, "Market Reference", "Make decisions with current mandi data."],
];

function SectionHeading({ eyebrow, title, copy, light = false }) {
  return (
    <div className={`max-w-2xl ${light ? "text-white" : ""}`}>
      <p className={`text-xs font-bold uppercase tracking-[0.2em] ${light ? "text-wheat" : "text-grove"}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-3 font-heading text-3xl md:text-4xl ${light ? "text-white" : "text-leaf"}`}>
        {title}
      </h2>
      {copy && <p className={`mt-3 leading-7 ${light ? "text-white/75" : "text-soil"}`}>{copy}</p>}
    </div>
  );
}

export default function Home() {
  const { user, role } = useAuth();
  const [listings, setListings] = useState([]);
  const [prices, setPrices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingPrices, setLoadingPrices] = useState(Boolean(user));
  const [pricesUnavailable, setPricesUnavailable] = useState(!user);

  useEffect(() => {
    listingApi
      .all({ page: 1 })
      .then((res) => setListings((res.data?.items || []).slice(0, 3)))
      .catch(() => setListings([]))
      .finally(() => setLoadingListings(false));
  }, []);

  useEffect(() => {
    if (!user) {
      setLoadingPrices(false);
      setPricesUnavailable(true);
      return;
    }

    mandiApi
      .all()
      .then((res) => setPrices(Array.isArray(res.data) ? res.data.slice(-4).reverse() : []))
      .catch(() => setPricesUnavailable(true))
      .finally(() => setLoadingPrices(false));

    orderApi
      .mine()
      .then((res) => setOrders((res.data || []).slice(0, 3)))
      .catch(() => setOrders([]));
  }, [user]);

  const roleLinks = role === "farmer"
    ? [["/farmer/listings/new", "Add Produce", Sprout], ["/farmer/orders", "My Orders", Truck]]
    : [["/buyer/marketplace", "Marketplace", Sprout], ["/buyer/orders", "My Orders", PackageCheck]];

  return (
    <div className="overflow-hidden bg-[#fbfaf5]">
      <section className="relative isolate min-h-[640px] overflow-hidden bg-[#173b2a]">
        <img
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-75"
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2200&q=85"
          alt="Sunlit agricultural fields"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(13,47,31,.88),rgba(13,47,31,.54),rgba(13,47,31,.18))]" />
        <div className="absolute bottom-0 left-0 right-0 -z-10 h-24 bg-gradient-to-t from-[#fbfaf5] to-transparent" />
        <div className="mx-auto grid min-h-[640px] max-w-7xl items-center gap-10 px-5 py-28 md:grid-cols-[1.1fr_.9fr] md:px-10">
          <div className="max-w-3xl text-white">
            <p className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-wheat">
              <Leaf size={17} /> A better route from harvest to market
            </p>
            <h1 className="font-heading text-5xl leading-[1.05] md:text-7xl">
              Connecting Farmers.<br />Building Trust.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/80 md:text-xl">
              A trusted platform connecting farmers and buyers for transparent, reliable agricultural trade.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="inline-flex items-center gap-2 bg-wheat px-5 py-3 font-bold text-leaf shadow-lg transition hover:-translate-y-1 hover:bg-white" to="/buyer/marketplace">
                Explore Marketplace <ArrowRight size={18} />
              </Link>
              <Link className="inline-flex items-center gap-2 border border-white/70 px-5 py-3 font-bold text-white transition hover:-translate-y-1 hover:bg-white hover:text-leaf" to="/register">
                Register Now
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/75">
              <span className="flex items-center gap-2"><Check size={16} className="text-wheat" /> Direct buyers</span>
              <span className="flex items-center gap-2"><Check size={16} className="text-wheat" /> Transparent trade</span>
              <span className="flex items-center gap-2"><Check size={16} className="text-wheat" /> Verified network</span>
            </div>
          </div>
          <div className="hidden justify-self-end md:block">
            <div className="w-72 border border-white/30 bg-[#f7f1df]/95 p-6 shadow-2xl backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-grove">Built for the harvest</p>
              <p className="mt-5 font-heading text-3xl leading-tight text-leaf">Better prices. Direct buyers. Transparent trade.</p>
              <div className="mt-8 border-t border-grove/15 pt-4 text-sm text-soil">
                <span className="block font-bold text-leaf">KrishiSetu promise</span>
                Every trade begins with clarity and trust.
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 right-[12%] animate-[float_7s_ease-in-out_infinite] text-wheat/80"><Leaf size={32} /></div>
      </section>

      <section className="border-b border-grove/10 bg-[#fbfaf5] px-5 py-16 md:px-10" id="how-it-works">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="A simpler trade route" title="From field to fair deal" copy="KrishiSetu brings the essential steps of agricultural trade into one dependable place." />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["01", "List your produce", "Farmers publish crop, quantity, quality, and asking price."],
              ["02", "Meet the right buyer", "Buyers discover real harvests and connect directly with farmers."],
              ["03", "Trade with confidence", "Negotiate, order, and follow progress through delivery."],
            ].map(([number, title, copy]) => (
              <div key={number} className="border-t-2 border-grove/30 pt-5 transition hover:-translate-y-1">
                <span className="font-heading text-4xl text-wheat">{number}</span>
                <h3 className="mt-4 font-heading text-xl text-leaf">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-soil">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#edf4e7] px-5 py-16 md:px-10" id="prices">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Live reference" title="Today's market prices" copy="Use the latest available mandi reference to plan your next move." />
            <Link className="inline-flex items-center gap-2 font-bold text-grove hover:text-leaf" to="/buyer/marketplace">View all prices <ChevronRight size={18} /></Link>
          </div>
          {loadingPrices ? (
            <div className="mt-8 h-36 animate-pulse bg-white/70" />
          ) : pricesUnavailable ? (
            <div className="mt-8 border border-grove/15 bg-white p-6 text-sm text-soil">
              <BarChart3 className="mb-3 text-grove" /> Sign in as a farmer, buyer, or admin to view live mandi prices.
            </div>
          ) : prices.length ? (
            <div className="mt-8 overflow-x-auto bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-grove/10 text-xs uppercase tracking-wider text-soil/70"><tr><th className="px-5 py-4">Crop</th><th className="px-5 py-4">Market</th><th className="px-5 py-4">Min</th><th className="px-5 py-4">Modal</th><th className="px-5 py-4">Max</th></tr></thead>
                <tbody>{prices.map((price) => <tr className="border-b border-grove/10 last:border-0" key={price._id}><td className="px-5 py-4 font-bold text-leaf">{price.cropName}</td><td className="px-5 py-4 text-soil">{price.market}</td><td className="px-5 py-4 text-soil">Rs. {price.minPrice}</td><td className="px-5 py-4 font-bold text-grove">Rs. {price.modalPrice}</td><td className="px-5 py-4 text-soil">Rs. {price.maxPrice}</td></tr>)}</tbody>
              </table>
            </div>
          ) : <EmptyState title="No mandi prices yet" text="Price references will appear here when available." />}
        </div>
      </section>

      <section className="px-5 py-16 md:px-10" id="marketplace">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6"><SectionHeading eyebrow="Fresh from the network" title="Featured harvests" copy="Explore active listings shared by farmers on KrishiSetu." /><Link className="inline-flex items-center gap-2 font-bold text-grove hover:text-leaf" to="/buyer/marketplace">Explore products <ChevronRight size={18} /></Link></div>
          {loadingListings ? <div className="mt-8 grid gap-5 md:grid-cols-3"><div className="h-80 animate-pulse bg-white" /><div className="h-80 animate-pulse bg-white" /><div className="h-80 animate-pulse bg-white" /></div> : listings.length ? <div className="mt-8 grid gap-5 md:grid-cols-3">{listings.map((listing) => <ListingCard key={listing._id} listing={listing} />)}</div> : <div className="mt-8"><EmptyState title="No active harvests yet" text="New farmer listings will appear here as they are published." /></div>}
        </div>
      </section>

      <section className="bg-[#163e2c] px-5 py-16 text-white md:px-10" id="trust">
        <div className="mx-auto max-w-7xl"><SectionHeading light eyebrow="The KrishiSetu standard" title="Trust grows with every trade." copy="A clear, human platform for the people who grow, source, and move India's food." /><div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{trustItems.map(([Icon, title, copy]) => <div className="flex gap-4" key={title}><Icon className="shrink-0 text-wheat" size={25} /><div><h3 className="font-heading text-lg">{title}</h3><p className="mt-1 text-sm leading-6 text-white/65">{copy}</p></div></div>)}</div></div>
      </section>

      <section className="px-5 py-16 md:px-10" id="roles"><div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2"><div className="border border-grove/15 bg-[#f1ead8] p-7 md:p-10"><Sprout className="text-grove" size={30} /><h2 className="mt-6 font-heading text-3xl text-leaf">For farmers</h2><p className="mt-3 max-w-md leading-7 text-soil">List your agricultural produce, reach buyers directly, get transparent market information, and manage your orders easily.</p><Link className="mt-7 inline-flex items-center gap-2 font-bold text-grove" to="/register">Join as Farmer <ArrowRight size={17} /></Link></div><div className="border border-grove/15 bg-white p-7 shadow-sm md:p-10"><CircleDollarSign className="text-grove" size={30} /><h2 className="mt-6 font-heading text-3xl text-leaf">For buyers</h2><p className="mt-3 max-w-md leading-7 text-soil">Discover quality agricultural products, compare listings, connect with farmers, and place orders securely.</p><Link className="mt-7 inline-flex items-center gap-2 font-bold text-grove" to="/buyer/marketplace">Explore products <ArrowRight size={17} /></Link></div></div></section>

      {user && orders.length > 0 && <section className="border-t border-grove/10 bg-white px-5 py-12 md:px-10"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-4"><SectionHeading eyebrow="Your activity" title="Recent orders" copy={`A quick view of your latest ${role === "farmer" ? "trade" : "purchases"}.`} /><Link className="font-bold text-grove" to={role === "farmer" ? "/farmer/orders" : "/buyer/orders"}>View orders <ChevronRight className="inline" size={17} /></Link></div><div className="mt-6 grid gap-3 md:grid-cols-3">{orders.map((order) => <div className="border border-grove/10 p-4" key={order._id}><div className="flex justify-between gap-3"><span className="font-bold text-leaf">{order.listing?.cropName || "Order"}</span><span className="text-xs font-bold capitalize text-grove">{order.status}</span></div><p className="mt-2 text-sm text-soil">{order.quantity} · Rs. {order.totalAmount || order.amount || "-"}</p></div>)}</div></div></section>}

      <section className="relative overflow-hidden bg-[#dfead6] px-5 py-16 md:px-10"><div className="absolute -right-4 top-4 text-grove/15"><Leaf size={150} /></div><div className="relative mx-auto max-w-7xl"><h2 className="max-w-2xl font-heading text-4xl text-leaf md:text-5xl">Grow together with KrishiSetu.</h2><p className="mt-4 max-w-xl text-lg text-soil">Connect directly. Trade transparently. Build trust.</p><div className="mt-7 flex flex-wrap gap-3"><Link className="inline-flex items-center gap-2 bg-leaf px-5 py-3 font-bold text-white transition hover:-translate-y-1 hover:bg-grove" to="/register">Register Now <ArrowRight size={18} /></Link><Link className="inline-flex items-center gap-2 border border-leaf px-5 py-3 font-bold text-leaf transition hover:-translate-y-1 hover:bg-white" to="/buyer/marketplace">Explore Marketplace <ArrowRight size={18} /></Link></div></div></section>

      <footer className="bg-[#102b20] px-5 py-12 text-white md:px-10"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.5fr_1fr_1fr]"><div><div className="flex items-center gap-2 font-heading text-2xl text-wheat"><Leaf size={23} /> KrishiSetu</div><p className="mt-4 max-w-xs text-sm leading-6 text-white/60">Connecting Farmers. Building Trust.<br />Better Prices. Direct Buyers. Transparent Trade.</p></div><div><h3 className="font-bold text-wheat">Explore</h3><div className="mt-4 grid gap-3 text-sm text-white/65"><Link to="/buyer/marketplace">Marketplace</Link><a href="#how-it-works">How it works</a><a href="#prices">Market prices</a><a href="#trust">About KrishiSetu</a></div></div><div><h3 className="font-bold text-wheat">Built on trust</h3><div className="mt-4 grid gap-3 text-sm text-white/65"><span>Verified Farmers</span><span>Secure Payments</span><span>Transparent Listings</span><span>Order Tracking</span><span>Dispute Support</span></div></div></div><div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-5 text-xs text-white/40">© {new Date().getFullYear()} KrishiSetu. Agriculture trade, made clearer.</div></footer>
    </div>
  );
}
