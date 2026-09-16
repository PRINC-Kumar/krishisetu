import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertCircle } from "lucide-react";
import { orderApi } from "../../api/orderApi.js";
import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import OrderStepper from "../../components/common/OrderStepper.jsx";
import Button from "../../components/common/Button.jsx";

export default function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);

  const load = () => {
    orderApi
      .mine()
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch((err) => toast.error(err.message || "Failed to load orders"));
  };

  useEffect(load, []);

  const move = async (id, status) => {
    setLoadingAction(true);
    try {
      await orderApi.status(id, status);
      toast.success(`Order marked as ${status}`);
      load();
    } catch (err) {
      toast.error(err.message || "Failed to update order status");
    } finally {
      setLoadingAction(false);
    }
  };

  const reportDispute = async (id) => {
    const reason = window.prompt("Describe the issue with this order to the admin:");
    if (!reason?.trim()) return;

    try {
      await orderApi.dispute(id, { reason: reason.trim() });
      toast.success("Dispute reported to admin");
      load();
    } catch (err) {
      toast.error(err.message || "Failed to report dispute");
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-heading text-4xl text-leaf">Farmer Orders</h1>
        <span className="text-sm font-semibold text-soil">
          {orders.length} total orders
        </span>
      </div>

      {orders.length ? (
        <div className="grid gap-4">
          {orders.map((o) => {
            const unitPrice = o.offeredPrice || o.listing?.pricePerUnit || 0;
            const totalAmount = o.quantity * unitPrice;
            const isDisputed = o.dispute?.status && o.dispute?.status !== "none";

            return (
              <Card key={o._id}>
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-xl text-leaf">
                        {o.listing?.cropName || "Crop Order"}
                      </h3>
                      {isDisputed && (
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                          <AlertCircle size={12} /> Dispute {o.dispute.status}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-soil">
                      Buyer: <span className="font-semibold">{o.buyer?.name}</span> ({o.buyer?.phone})
                    </p>
                    <p className="text-sm text-soil">
                      Quantity: <span className="font-semibold">{o.quantity} {o.listing?.unit || "units"}</span> ·{" "}
                      Price: Rs. {unitPrice}/{o.listing?.unit || "unit"} ·{" "}
                      Payment: <span className="font-semibold">{o.paymentMethod}</span>
                    </p>
                    <p className="mt-1 text-base font-bold text-leaf">
                      Total Payout: Rs. {totalAmount}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Accept Order */}
                    <Button
                      onClick={() => move(o._id, "Accepted")}
                      disabled={loadingAction || o.status !== "Pending"}
                    >
                      Accept Order
                    </Button>

                    {/* Ship Order */}
                    <Button
                      onClick={() => move(o._id, "Shipped")}
                      disabled={loadingAction || o.status !== "Accepted"}
                    >
                      Mark Shipped
                    </Button>

                    {/* Cancel Order (Allowed before shipping) */}
                    <Button
                      variant="secondary"
                      onClick={() => move(o._id, "Cancelled")}
                      disabled={
                        loadingAction ||
                        ["Shipped", "Delivered", "Cancelled"].includes(o.status)
                      }
                    >
                      Cancel
                    </Button>

                    {/* Dispute button */}
                    {!isDisputed && o.status !== "Cancelled" && (
                      <button
                        onClick={() => reportDispute(o._id)}
                        className="rounded-2xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                      >
                        Report Issue
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <OrderStepper status={o.status} />
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No orders yet"
          text="When buyers place orders for your harvest, they will appear here for you to accept and fulfill."
        />
      )}
    </section>
  );
}
