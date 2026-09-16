import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi.js";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

const DISPUTE_STATUSES = [
  { value: "none", label: "All Orders" },
  { value: "flagged", label: "Flagged" },
  { value: "resolved", label: "Resolved" },
];

const statusColor = {
  none: "text-soil",
  flagged: "text-red-600 font-semibold",
  resolved: "text-green-600 font-semibold",
};

export default function Disputes() {
  const [orders, setOrders] = useState([]);
  const [notes, setNotes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("flagged"); // default: show flagged

  const load = () => {
    setIsLoading(true);
    adminApi
      .orders()
      .then((res) => setOrders(res.data ?? []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const update = async (id, status) => {
    setActionId(id);
    try {
      await adminApi.dispute(id, { status, adminNote: notes[id] ?? "" });
      toast.success(
        status === "resolved" ? "Dispute resolved" : "Order flagged as dispute",
      );
      load();
    } catch (err) {
      toast.error(err?.message || "Failed to update dispute");
    } finally {
      setActionId(null);
    }
  };

  // Filter: if filterStatus is "none", show all orders; otherwise filter by status
  const filtered =
    filterStatus === "none"
      ? orders
      : orders.filter((o) => o.dispute?.status === filterStatus);

  if (isLoading) return <Loader />;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-4xl text-leaf">Orders & Disputes</h1>
        <div className="flex gap-2">
          {DISPUTE_STATUSES.map(({ value, label }) => {
            const count =
              value === "none"
                ? orders.length
                : orders.filter((o) => o.dispute?.status === value).length;
            return (
              <button
                key={value}
                onClick={() => setFilterStatus(value)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  filterStatus === value
                    ? "bg-leaf text-white"
                    : "border border-leaf/30 text-leaf hover:bg-leaf/10"
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          message={
            filterStatus === "flagged"
              ? "No flagged disputes"
              : filterStatus === "resolved"
                ? "No resolved disputes"
                : "No orders found"
          }
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((o) => (
            <Card key={o._id}>
              <div className="grid gap-3 md:grid-cols-[1fr_280px]">
                <div>
                  <h3 className="font-heading text-xl text-leaf">
                    {o.listing?.cropName || "Deleted Listing"}
                  </h3>
                  <p className="text-sm text-soil">
                    Buyer: <strong>{o.buyer?.name || "—"}</strong> · Farmer:{" "}
                    <strong>{o.farmer?.name || "—"}</strong>
                  </p>
                  <p className="text-sm text-soil">
                    Qty: {o.quantity} · ₹{o.offeredPrice ?? "—"} · Status:{" "}
                    <span className="font-semibold">{o.status}</span>
                  </p>
                  <p className={`mt-1 text-sm ${statusColor[o.dispute?.status] || "text-soil"}`}>
                    Dispute:{" "}
                    <span className="capitalize">
                      {o.dispute?.status || "none"}
                    </span>
                  </p>
                  {o.dispute?.adminNote && (
                    <p className="mt-1 text-xs italic text-soil/70">
                      Admin note: {o.dispute.adminNote}
                    </p>
                  )}
                </div>

                <div className="grid gap-2 self-start">
                  <input
                    className="field text-sm"
                    placeholder="Admin note (optional)"
                    value={notes[o._id] ?? o.dispute?.adminNote ?? ""}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [o._id]: e.target.value }))
                    }
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      disabled={
                        actionId === o._id ||
                        o.dispute?.status === "flagged"
                      }
                      onClick={() => update(o._id, "flagged")}
                    >
                      {actionId === o._id ? "…" : "Flag"}
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={
                        actionId === o._id ||
                        o.dispute?.status === "resolved"
                      }
                      onClick={() => update(o._id, "resolved")}
                    >
                      {actionId === o._id ? "…" : "Resolve"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
