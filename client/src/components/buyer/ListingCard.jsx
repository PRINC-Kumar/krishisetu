import { Link } from "react-router-dom";
import { BadgeCheck, MapPin } from "lucide-react";

import Card from "../common/Card.jsx";
import { API_URL } from "../../utils/constants.js";

export default function ListingCard({ listing }) {
  return (
    <Card>
      <img
        className="h-40 w-full rounded-2xl object-cover"
        src={
          listing.photoUrl
            ? `${API_URL}${listing.photoUrl}`
            : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80"
        }
        alt={listing.cropName}
      />

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl text-leaf">{listing.cropName}</h3>

          <p className="text-sm text-soil">
            {listing.quantity} {listing.unit} at Rs. {listing.pricePerUnit}/
            {listing.unit}
          </p>
        </div>

        {listing.farmer?.isVerified && (
          <span className="flex items-center gap-1 rounded-full bg-grove/10 px-2 py-1 text-xs font-semibold text-grove">
            <BadgeCheck size={14} />
            Verified
          </span>
        )}
      </div>

      <p className="mt-3 flex items-center gap-1 text-sm text-soil">
        <MapPin size={15} />
        {listing.location?.district}, {listing.location?.state}
      </p>

      <Link
        className="mt-4 block rounded-2xl bg-leaf px-4 py-3 text-center text-sm font-semibold text-white"
        to={`/buyer/listings/${listing._id}`}
      >
        View & Negotiate
      </Link>
    </Card>
  );
}
