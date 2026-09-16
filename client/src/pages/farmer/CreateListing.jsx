import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ListingForm from "../../components/farmer/ListingForm.jsx";
import { listingApi } from "../../api/listingApi.js";
import { useAuth } from "../../hooks/useAuth.js";

export default function CreateListing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const submit = async (formData) => {
    try {
      await listingApi.create(formData);
      toast.success("Listing created successfully!");
      navigate("/farmer/dashboard");
    } catch (error) {
      toast.error(error.message || "Failed to create listing");
    }
  };

  if (!user?.isVerified) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="font-heading text-3xl text-leaf">Verification Required</h1>
          <p className="mt-3 text-soil">
            Your farmer account is currently awaiting administrative verification.
            To maintain marketplace trust, only verified farmers can post new harvest listings.
          </p>
          <Link
            to="/farmer/dashboard"
            className="mt-6 inline-block rounded-2xl bg-leaf px-6 py-3 font-semibold text-white hover:bg-grove transition"
          >
            Back to Farmer Dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-5 font-heading text-4xl text-leaf">Create Harvest Listing</h1>
      <ListingForm onSubmit={submit} />
    </section>
  );
}
