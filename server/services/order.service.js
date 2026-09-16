// Validates state machine transitions based on current status, target status, and actor role.
export const canMoveOrder = (currentStatus, nextStatus, role) => {
  if (currentStatus === nextStatus) return false;
  if (["Delivered", "Cancelled"].includes(currentStatus)) return false;

  // Cancellation rules
  if (nextStatus === "Cancelled") {
    // Only allow cancellation while order is Pending or Accepted (before physical shipping)
    if (["Pending", "Accepted"].includes(currentStatus)) {
      return ["buyer", "farmer", "admin"].includes(role);
    }
    return false;
  }

  // Progressive status flow
  if (currentStatus === "Pending" && nextStatus === "Accepted") {
    return ["farmer", "admin"].includes(role);
  }

  if (currentStatus === "Accepted" && nextStatus === "Shipped") {
    return ["farmer", "admin"].includes(role);
  }

  if (currentStatus === "Shipped" && nextStatus === "Delivered") {
    return ["buyer", "farmer", "admin"].includes(role);
  }

  return false;
};
