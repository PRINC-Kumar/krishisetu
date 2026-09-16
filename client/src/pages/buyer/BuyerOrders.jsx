import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { orderApi } from "../../api/orderApi.js";
import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import OrderStepper from "../../components/common/OrderStepper.jsx";
import Button from "../../components/common/Button.jsx";

export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);

  const load = () => {
    orderApi
      .mine()
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch((err) => toast.error(err.message || "Failed to load orders"));
  };

  useEffect(load, []);

  const cancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setLoadingAction(true);
    try {
      await orderApi.status(id, "Cancelled");
      toast.success("Order cancelled");
      load();
    } catch (err) {
      toast.error(err.message || "Could not cancel order");
    } finally {
      setLoadingAction(false);
    }
  };

  const confirmDelivery = async (id) => {
    setLoadingAction(true);
    try {
      await orderApi.status(id, "Delivered");
      toast.success("Delivery confirmed! Order completed.");
      load();
    } catch (err) {
      toast.error(err.message || "Failed to confirm delivery");
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
        <h1 className="font-heading text-4xl text-leaf">My Orders</h1>
        <span className="text-sm font-semibold text-soil">
          {orders.length} orders
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
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-xl text-leaf">
                        {o.listing?.cropName || "Harvest Order"}
                      </h3>
                      {isDisputed && (
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                          <AlertCircle size={12} /> Dispute {o.dispute.status}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-soil">
                      Farmer: <span className="font-semibold">{o.farmer?.name}</span> ({o.farmer?.phone})
                    </p>
                    <p className="text-sm text-soil">
                      Quantity: <span className="font-semibold">{o.quantity} {o.listing?.unit || "units"}</span> ·{" "}
                      Price: Rs. {unitPrice}/{o.listing?.unit || "unit"} ·{" "}
                      Payment: <span className="font-semibold">{o.paymentMethod}</span>
                    </p>
                    <p className="mt-1 text-base font-bold text-leaf">
                      Total Cost: Rs. {totalAmount}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Confirm delivery if shipped */}
                    {o.status === "Shipped" && (
                      <Button
                        className="flex items-center gap-1"
                        onClick={() => confirmDelivery(o._id)}
                        disabled={loadingAction}
                      >
                        <CheckCircle2 size={16} /> Confirm Delivery
                      </Button>
                    )}

                    {/* Cancel button if pending */}
                    {o.status === "Pending" && (
                      <Button
                        variant="secondary"
                        onClick={() => cancelOrder(o._id)}
                        disabled={loadingAction}
                      >
                        Cancel Request
                      </Button>
                    )}

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
          text="Place an order from the marketplace when you find the right harvest."
        />
      )}
    </section>
  );
}
