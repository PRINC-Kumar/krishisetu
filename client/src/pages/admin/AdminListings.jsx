import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi.js";
import Card from "../../components/common/Card.jsx";
import Loader from "../../components/common/Loader.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

const statusBadge = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  sold: "bg-blue-100 text-blue-700",
};

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    adminApi
      .listings()
      .then((res) => setListings(res.data ?? []))
      .catch(() => toast.error("Failed to load listings"))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = listings.filter((l) => {
    const matchesSearch =
      !search ||
      l.cropName?.toLowerCase().includes(search.toLowerCase()) ||
      l.farmer?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || l.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <Loader />;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-5 font-heading text-4xl text-leaf">All Listings</h1>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          className="field max-w-xs text-sm"
          placeholder="Search crop or farmer name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {["all", "active", "inactive", "sold"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition ${
                filterStatus === s
                  ? "bg-leaf text-white"
                  : "border border-leaf/30 text-leaf hover:bg-leaf/10"
              }`}
            >
              {s} (
              {s === "all"
                ? listings.length
                : listings.filter((l) => l.status === s).length}
              )
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No listings match your filters" />
      ) : (
        <div className="grid gap-4">
          {filtered.map((l) => (
            <Card key={l._id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-xl text-leaf">
                      {l.cropName}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${statusBadge[l.status] || "bg-gray-100 text-gray-600"}`}
                    >
                      {l.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-soil">
                    Farmer:{" "}
                    <strong>{l.farmer?.name || "Unknown"}</strong>
                    {l.farmer?.isVerified === false && (
                      <span className="ml-2 text-xs text-amber-600">
                        (Unverified)
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-soil">
                    Qty: {l.quantity} {l.unit} · ₹{l.pricePerUnit}/{l.unit}
                  </p>
                  <p className="text-sm text-soil">
                    Location: {l.location?.district}, {l.location?.state}
                  </p>
                </div>
                {l.photoUrl && (
                  <img
                    src={l.photoUrl}
                    alt={l.cropName}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

