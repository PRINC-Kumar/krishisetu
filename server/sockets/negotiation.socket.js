import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Offer } from "../models/Offer.model.js";

const roomName = ({ listing, buyer, farmer }) =>
  `listing:${listing}:buyer:${buyer}:farmer:${farmer}`;

// Real-time negotiation socket handlers with error catching and auth validation.
export const registerNegotiationSocket = (io) => {
  io.use((socket, next) => {
    try {
      let token = socket.handshake.auth?.token;
      if (!token) {
        const cookie = socket.handshake.headers.cookie || "";
        const match = cookie.match(/(?:^|;\s*)token=([^;]+)/);
        token = match ? match[1] : null;
      }

      if (!token) return next(new Error("Unauthorized"));
      socket.user = jwt.verify(token, env.jwtSecret);
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join_negotiation", (payload) => {
      try {
        if (payload?.listing && payload?.buyer && payload?.farmer) {
          socket.join(roomName(payload));
        }
      } catch (err) {
        console.error("join_negotiation error:", err.message);
      }
    });

    socket.on("send_offer", async (payload, callback) => {
      try {
        const offer = await Offer.create({
          listing: payload.listing || payload.listingId,
          buyer: payload.buyer,
          farmer: payload.farmer,
          sender: socket.user.id,
          pricePerUnit: Number(payload.pricePerUnit),
          quantity: Number(payload.quantity),
          message: payload.message || "",
        });

        const populated = await Offer.findById(offer._id).populate(
          "sender",
          "name role",
        );

        io.to(roomName(payload)).emit("receive_offer", populated);
        callback?.({ success: true, offer: populated });
      } catch (err) {
        console.error("send_offer error:", err.message);
        callback?.({ success: false, message: err.message });
      }
    });

    socket.on("accept_offer", async ({ offerId, ...room }, callback) => {
      try {
        const offer = await Offer.findById(offerId);
        if (!offer) {
          return callback?.({ success: false, message: "Offer not found" });
        }
        if (String(offer.sender) === socket.user.id) {
          return callback?.({
            success: false,
            message: "You cannot accept your own offer",
          });
        }

        offer.status = "accepted";
        await offer.save();

        io.to(roomName(room)).emit("offer_accepted", offer);
        callback?.({ success: true, offer });
      } catch (err) {
        console.error("accept_offer error:", err.message);
        callback?.({ success: false, message: err.message });
      }
    });

    socket.on("reject_offer", async ({ offerId, ...room }, callback) => {
      try {
        const offer = await Offer.findById(offerId);
        if (!offer) {
          return callback?.({ success: false, message: "Offer not found" });
        }
        if (String(offer.sender) === socket.user.id) {
          return callback?.({
            success: false,
            message: "You cannot reject your own offer",
          });
        }

        offer.status = "rejected";
        await offer.save();

        io.to(roomName(room)).emit("offer_rejected", offer);
        callback?.({ success: true, offer });
      } catch (err) {
        console.error("reject_offer error:", err.message);
        callback?.({ success: false, message: err.message });
      }
    });
  });
};
