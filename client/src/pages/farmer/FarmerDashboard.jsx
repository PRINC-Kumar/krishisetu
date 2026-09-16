import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Trash2, Check, X } from "lucide-react";
import { listingApi } from "../../api/listingApi.js";
import { offerApi } from "../../api/offerApi.js";
import MandiChart from "../../components/common/MandiChart.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import { useAuth } from "../../hooks/useAuth.js";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [listingsRes, offersRes] = await Promise.all([
        listingApi.mine(),
        offerApi.thread(),
      ]);
      setListings(Array.isArray(listingsRes.data) ? listingsRes.data : []);
      setOffers(Array.isArray(offersRes.data) ? offersRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const deleteListing = async (id) => {
    if (!window.confirm("Are you sure you want to remove this listing?")) return;
    try {
      await listingApi.remove(id);
      toast.success("Listing removed");
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to remove listing");
    }
  };

  const decideOffer = async (offerId, status) => {
    try {
      await offerApi.decide(offerId, status);
      toast.success(`Offer marked as ${status}`);
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to update offer");
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl text-leaf">Farmer Dashboard</h1>
          <p className="text-soil">
            {user?.isVerified
              ? "Verified Farmer Account · Approved to create listings"
              : "Account pending admin approval. You can create listings once verified."}
          </p>
        </div>
        {user?.isVerified ? (
          <Link
            className="rounded-2xl bg-leaf px-5 py-3 font-semibold text-white shadow-sm hover:bg-grove transition"
            to="/farmer/listings/new"
          >
            + Create New Listing
          </Link>
        ) : (
          <span className="rounded-2xl bg-yellow-100 px-4 py-2 text-xs font-bold text-yellow-800">
            Approval Pending
          </span>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <MandiChart />

        {/* Harvest Listings Management */}
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl text-leaf">My Harvest Listings</h2>
            <span className="text-xs font-semibold text-soil">
              {listings.length} items
            </span>
          </div>

          {listings.length ? (
            <div className="mt-4 grid gap-3 max-h-[420px] overflow-y-auto pr-1">
              {listings.map((l) => (
                <div
                  key={l._id}
                  className="flex items-center justify-between rounded-2xl bg-cream p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <b className="text-leaf">{l.cropName}</b>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          l.status === "active"
                            ? "bg-green-100 text-green-800"
                            : l.status === "sold"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {l.status}
                      </span>
                    </div>
                    <p className="text-sm text-soil">
                      {l.quantity} {l.unit} · Rs. {l.pricePerUnit}/{l.unit}
                    </p>
                    <p className="text-xs text-soil/70">
                      {l.location?.district}, {l.location?.state}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {l.status === "active" && (
                      <button
                        onClick={() => deleteListing(l._id)}
                        className="rounded-xl p-2 text-red-500 hover:bg-red-50 transition"
                        title="Remove Listing"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No listings yet"
              text={
                user?.isVerified
                  ? "Click '+ Create New Listing' above to publish your harvests."
                  : "Once approved by admin, add your first harvest listing here."
              }
            />
          )}
        </Card>
      </div>

      {/* Incoming Buyer Negotiations & Offers */}
      <div className="mt-8">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl text-leaf">
              Incoming Buyer Bids & Negotiations
            </h2>
            <span className="text-xs font-semibold text-soil">
              {offers.filter((o) => o.status === "pending").length} Pending Bids
            </span>
          </div>

          {offers.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {offers.map((o) => {
                const isBuyerSender = o.sender?.role === "buyer";
                return (
                  <div
                    key={o._id}
                    className="flex flex-col justify-between rounded-2xl border border-grove/15 bg-white p-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-leaf">
                          Crop: {o.listing?.cropName || "Listing"}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                            o.status === "accepted"
                              ? "bg-green-100 text-green-800"
                              : o.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {o.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-soil">
                        <span className="font-semibold">Buyer:</span> {o.buyer?.name} ({o.buyer?.phone})
                      </p>
                      <p className="text-sm text-soil">
                        <span className="font-semibold">Offer:</span> Rs. {o.pricePerUnit} for {o.quantity} units (Total: Rs. {o.pricePerUnit * o.quantity})
                      </p>
                      {o.message && (
                        <p className="mt-2 rounded-xl bg-cream/70 p-2 text-xs italic text-soil">
                          "{o.message}"
                        </p>
                      )}
                    </div>

                    {/* Action buttons for pending bids sent by buyers */}
                    {isBuyerSender && o.status === "pending" && (
                      <div className="mt-4 flex gap-2 border-t border-cream pt-3">
                        <Button
                          className="flex flex-1 items-center justify-center gap-1 py-2 text-xs"
                          onClick={() => decideOffer(o._id, "accepted")}
                        >
                          <Check size={14} /> Accept Offer
                        </Button>
                        <Button
                          variant="secondary"
                          className="flex flex-1 items-center justify-center gap-1 py-2 text-xs"
                          onClick={() => decideOffer(o._id, "rejected")}
                        >
                          <X size={14} /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-soil">
              No negotiation bids received yet. Offers from buyers will appear here.
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
