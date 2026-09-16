import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { listingApi } from "../../api/listingApi.js";
import { orderApi } from "../../api/orderApi.js";
import { offerApi } from "../../api/offerApi.js";
import { useSocket } from "../../hooks/useSocket.js";
import { useAuth } from "../../hooks/useAuth.js";
import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/Card.jsx";
import { API_URL } from "../../utils/constants.js";

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [loadingOffer, setLoadingOffer] = useState(false);

  const [form, setForm] = useState({
    quantity: 1,
    pricePerUnit: "",
    message: "",
    paymentMethod: "COD",
  });

  useEffect(() => {
    listingApi
      .one(id)
      .then((res) => {
        setListing(res.data);
        setForm((p) => ({
          ...p,
          pricePerUnit: res.data.pricePerUnit,
          quantity: Math.min(1, res.data.quantity || 1),
        }));
      })
      .catch((err) => toast.error(err.message || "Failed to load listing"));

    offerApi
      .thread({ listingId: id })
      .then((res) => setOffers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setOffers([]));
  }, [id]);

  useEffect(() => {
    if (!socket || !listing || !user) return;
    const room = { listing: id, buyer: user.id, farmer: listing.farmer?._id };
    socket.emit("join_negotiation", room);

    const handleReceive = (offer) => {
      setOffers((p) => {
        const exists = p.some((item) => item._id === offer._id);
        return exists ? p : [...p, offer];
      });
    };

    const handleAccepted = (updated) => {
      setOffers((p) =>
        p.map((o) => (o._id === updated._id ? { ...o, status: "accepted" } : o)),
      );
      toast.success("An offer was accepted!");
    };

    const handleRejected = (updated) => {
      setOffers((p) =>
        p.map((o) => (o._id === updated._id ? { ...o, status: "rejected" } : o)),
      );
    };

    socket.on("receive_offer", handleReceive);
    socket.on("offer_accepted", handleAccepted);
    socket.on("offer_rejected", handleRejected);

    return () => {
      socket.off("receive_offer", handleReceive);
      socket.off("offer_accepted", handleAccepted);
      socket.off("offer_rejected", handleRejected);
    };
  }, [socket, listing, user, id]);

  const placeOrder = async () => {
    const qty = Number(form.quantity);
    if (!qty || qty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    if (listing && qty > listing.quantity) {
      toast.error(
        `Quantity cannot exceed available stock (${listing.quantity} ${listing.unit})`,
      );
      return;
    }

    setLoadingOrder(true);
    try {
      await orderApi.create({
        listingId: id,
        quantity: qty,
        offeredPrice: Number(form.pricePerUnit) || listing.pricePerUnit,
        paymentMethod: form.paymentMethod,
      });
      toast.success("Order request placed successfully!");
      navigate("/buyer/orders");
    } catch (error) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoadingOrder(false);
    }
  };

  const sendOffer = async () => {
    const qty = Number(form.quantity);
    const price = Number(form.pricePerUnit);

    if (!qty || qty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    if (!price || price <= 0) {
      toast.error("Please enter a valid offer price");
      return;
    }

    const payload = {
      listing: id,
      listingId: id,
      buyer: user.id,
      farmer: listing.farmer?._id,
      quantity: qty,
      pricePerUnit: price,
      message: form.message,
    };

    setLoadingOffer(true);
    try {
      if (socket && socket.connected) {
        socket.emit("send_offer", payload, (res) => {
          if (res?.success && res.offer) {
            setOffers((p) => {
              const exists = p.some((item) => item._id === res.offer._id);
              return exists ? p : [...p, res.offer];
            });
            toast.success("Offer sent in real-time");
          } else {
            toast.error(res?.message || "Could not send offer via socket");
          }
        });
      } else {
        // Safe HTTP fallback: append to array, never replace with single object
        const res = await offerApi.create(payload);
        setOffers((prev) => [...prev, res.data]);
        toast.success("Offer sent");
      }
      setForm((p) => ({ ...p, message: "" }));
    } catch (error) {
      toast.error(error.message || "Failed to send offer");
    } finally {
      setLoadingOffer(false);
    }
  };

  const decideCounterOffer = async (offerId, status) => {
    try {
      await offerApi.decide(offerId, status);
      setOffers((p) =>
        p.map((o) => (o._id === offerId ? { ...o, status } : o)),
      );
      toast.success(`Offer ${status}`);
    } catch (error) {
      toast.error(error.message || "Failed to update offer");
    }
  };

  if (!listing) return null;

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <img
          className="h-80 w-full rounded-2xl object-cover"
          src={
            listing.photoUrl
              ? `${API_URL}${listing.photoUrl}`
              : "https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=1100&q=80"
          }
          alt={listing.cropName}
        />
        <h1 className="mt-5 font-heading text-4xl text-leaf">
          {listing.cropName}
        </h1>
        <p className="text-soil">
          {listing.quantity} {listing.unit} available in{" "}
          {listing.location?.district}, {listing.location?.state}
        </p>
        <p className="mt-2 font-semibold text-leaf">
          Listing Price: Rs. {listing.pricePerUnit}/{listing.unit}
        </p>

        {listing.farmer && (
          <div className="mt-4 rounded-xl bg-cream/60 p-3 text-sm text-soil">
            <span className="font-semibold text-leaf">Farmer: </span>
            {listing.farmer.name} · {listing.farmer.phone}
            {listing.farmer.isVerified && (
              <span className="ml-2 rounded-full bg-grove/10 px-2 py-0.5 text-xs font-bold text-grove">
                ✓ Verified Seller
              </span>
            )}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-heading text-2xl text-leaf">Negotiate & Order</h2>
        <div className="mt-4 grid gap-3">
          <div>
            <label className="text-xs font-semibold text-soil">
              Quantity ({listing.unit}) - Max {listing.quantity}
            </label>
            <input
              className="field mt-1"
              type="number"
              min="1"
              max={listing.quantity}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-soil">
              Offered Price per {listing.unit} (Rs.)
            </label>
            <input
              className="field mt-1"
              type="number"
              min="0"
              value={form.pricePerUnit}
              onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-soil">
              Total Estimated: Rs. {(Number(form.quantity) || 0) * (Number(form.pricePerUnit) || 0)}
            </label>
            <textarea
              className="field mt-1"
              placeholder="Message or quality note to farmer..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-soil">Payment Method</label>
            <select
              className="field mt-1"
              value={form.paymentMethod}
              onChange={(e) =>
                setForm({ ...form, paymentMethod: e.target.value })
              }
            >
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="Pay Offline">Pay Offline (Direct Transfer)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button onClick={sendOffer} disabled={loadingOffer || listing.quantity <= 0}>
              {loadingOffer ? "Sending..." : "Send Offer"}
            </Button>
            <Button
              variant="secondary"
              onClick={placeOrder}
              disabled={loadingOrder || listing.quantity <= 0}
            >
              {loadingOrder ? "Placing..." : "Place Order"}
            </Button>
          </div>
        </div>

        <div className="mt-6 border-t border-cream pt-4">
          <h3 className="font-heading text-lg text-leaf">Negotiation History</h3>
          <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
            {offers.length === 0 ? (
              <p className="text-xs text-soil/70">No negotiation history yet.</p>
            ) : (
              offers.map((o) => {
                const isMyOffer = o.sender?._id === user?.id || o.sender === user?.id;
                return (
                  <div
                    key={o._id || o.createdAt}
                    className={`rounded-2xl p-3 text-sm ${
                      isMyOffer ? "bg-cream text-leaf" : "bg-wheat/40 text-soil"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        {isMyOffer ? "You" : o.sender?.name || "Farmer"}: Rs. {o.pricePerUnit} for {o.quantity} {listing.unit}
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
                    {o.message && <p className="mt-1 text-xs text-soil">{o.message}</p>}

                    {/* Allow buyer to accept/reject farmer's counter offers */}
                    {!isMyOffer && o.status === "pending" && (
                      <div className="mt-2 flex gap-2">
                        <button
                          className="rounded-lg bg-leaf px-2 py-1 text-xs font-semibold text-white hover:bg-grove"
                          onClick={() => decideCounterOffer(o._id, "accepted")}
                        >
                          Accept Offer
                        </button>
                        <button
                          className="rounded-lg bg-soil/20 px-2 py-1 text-xs font-semibold text-soil hover:bg-soil/30"
                          onClick={() => decideCounterOffer(o._id, "rejected")}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Card>
    </section>
  );
}
