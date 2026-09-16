import { XCircle } from "lucide-react";
import { orderSteps } from "../../utils/constants.js";

export default function OrderStepper({ status }) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
        <XCircle size={16} />
        Order Cancelled
      </div>
    );
  }

  const index = orderSteps.indexOf(status);

  return (
    <div className="flex gap-2">
      {orderSteps.map((step, i) => (
        <div key={step} className="flex-1">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              i <= index ? "bg-grove" : "bg-grove/15"
            }`}
          />
          <p
            className={`mt-1 text-xs ${
              i <= index ? "font-bold text-leaf" : "text-soil/60"
            }`}
          >
            {step}
          </p>
        </div>
      ))}
    </div>
  );
}
