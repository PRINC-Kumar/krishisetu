import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi.js";
import StatCard from "../../components/admin/StatCard.jsx";
import Loader from "../../components/common/Loader.jsx";
import Button from "../../components/common/Button.jsx";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    adminApi
      .dashboard()
      .then((res) => setStats(res.data))
      .catch(() => toast.error("Failed to load dashboard stats"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loader />;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 font-heading text-4xl text-leaf">Admin Dashboard</h1>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Total Users" value={stats?.users} />
        <StatCard label="Total Listings" value={stats?.listings} />
        <StatCard label="Total Orders" value={stats?.orders} />
        <StatCard label="Pending Farmers" value={stats?.pendingFarmers} />
      </div>

      {stats?.pendingFarmers > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-semibold text-amber-800">
            ⚠ {stats.pendingFarmers} farmer
            {stats.pendingFarmers !== 1 ? "s" : ""} pending verification
          </p>
          <Button
            className="mt-3"
            onClick={() => navigate("/admin/users?filter=pending")}
          >
            Review Pending Farmers
          </Button>
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <button
          onClick={() => navigate("/admin/users")}
          className="rounded-2xl border border-grove/10 bg-white/90 p-5 shadow-sm text-left hover:shadow-md transition"
        >
          <p className="font-heading text-xl text-leaf">Manage Users</p>
          <p className="mt-1 text-sm text-soil">
            Approve/reject farmers, view all accounts
          </p>
        </button>
        <button
          onClick={() => navigate("/admin/listings")}
          className="rounded-2xl border border-grove/10 bg-white/90 p-5 shadow-sm text-left hover:shadow-md transition"
        >
          <p className="font-heading text-xl text-leaf">View Listings</p>
          <p className="mt-1 text-sm text-soil">
            Browse all active and inactive crop listings
          </p>
        </button>
        <button
          onClick={() => navigate("/admin/disputes")}
          className="rounded-2xl border border-grove/10 bg-white/90 p-5 shadow-sm text-left hover:shadow-md transition"
        >
          <p className="font-heading text-xl text-leaf">Orders & Disputes</p>
          <p className="mt-1 text-sm text-soil">
            Manage flagged orders and resolve disputes
          </p>
        </button>
      </div>
    </section>
  );
}
