import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi.js";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState(null); // tracks which user's button is busy
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get("filter"); // "pending" | null

  const load = () => {
    setIsLoading(true);
    adminApi
      .users()
      .then((res) => setUsers(res.data ?? []))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const verify = async (id, newValue) => {
    setActionId(id);
    try {
      await adminApi.verifyFarmer(id, newValue);
      toast.success(
        newValue ? "Farmer approved successfully" : "Farmer unverified",
      );
      load();
    } catch (err) {
      toast.error(err?.message || "Failed to update farmer verification");
    } finally {
      setActionId(null);
    }
  };

  // Filter logic
  const filtered =
    filterParam === "pending"
      ? users.filter((u) => u.role === "farmer" && !u.isVerified)
      : users;

  const pendingCount = users.filter(
    (u) => u.role === "farmer" && !u.isVerified,
  ).length;

  if (isLoading) return <Loader />;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-4xl text-leaf">Manage Users</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setSearchParams({})}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              !filterParam
                ? "bg-leaf text-white"
                : "border border-leaf/30 text-leaf hover:bg-leaf/10"
            }`}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setSearchParams({ filter: "pending" })}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              filterParam === "pending"
                ? "bg-amber-600 text-white"
                : "border border-amber-500/40 text-amber-700 hover:bg-amber-50"
            }`}
          >
            Pending Farmers ({pendingCount})
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          message={
            filterParam === "pending"
              ? "No pending farmers awaiting approval"
              : "No users found"
          }
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((u) => (
            <Card key={u._id}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading text-xl text-leaf">{u.name}</h3>
                  <p className="text-sm capitalize text-soil">
                    <span className="inline-block rounded-full bg-leaf/10 px-2 py-0.5 text-xs font-bold text-leaf">
                      {u.role}
                    </span>{" "}
                    · {u.email || u.phone}
                    {u.phone && u.email ? ` · ${u.phone}` : ""}
                    {u.location?.district ? ` · ${u.location.district}` : ""}
                  </p>
                  {u.role === "farmer" && (
                    <p
                      className={`mt-1 text-xs font-semibold ${
                        u.isVerified ? "text-green-600" : "text-amber-600"
                      }`}
                    >
                      {u.isVerified ? "✓ Verified" : "⏳ Pending verification"}
                    </p>
                  )}
                </div>

                {u.role === "farmer" && (
                  <Button
                    variant={u.isVerified ? "secondary" : "primary"}
                    disabled={actionId === u._id}
                    onClick={() => verify(u._id, !u.isVerified)}
                  >
                    {actionId === u._id
                      ? "Updating…"
                      : u.isVerified
                        ? "Revoke Verification"
                        : "Approve Farmer"}
                  </Button>
                )}
              </div>
          </Card>
        ))}
      </div>
      )}
    </section>
  );
}
