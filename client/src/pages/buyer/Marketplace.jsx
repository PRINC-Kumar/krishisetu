import { useEffect, useState } from "react";
import { listingApi } from "../../api/listingApi.js";
import ListingCard from "../../components/buyer/ListingCard.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import MandiChart from "../../components/common/MandiChart.jsx";
import Button from "../../components/common/Button.jsx";
import { states, districts } from "../../utils/constants.js";

export default function Marketplace() {
  const [filters, setFilters] = useState({
    search: "",
    state: "",
    district: "",
    minPrice: "",
    maxPrice: "",
    page: 1,
  });
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    listingApi
      .all(filters)
      .then((res) => {
        setListings(res.data.items || []);
        setPagination({
          page: res.data.page || 1,
          pages: res.data.pages || 1,
          total: res.data.total || 0,
        });
      })
      .catch((err) => console.error("Error fetching listings:", err))
      .finally(() => setLoading(false));
  }, [filters]);

  const setFilter = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value, page: 1 }));
  };

  const changePage = (newPage) => {
    setFilters((p) => ({ ...p, page: newPage }));
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl text-leaf">Marketplace</h1>
          <p className="text-soil">
            Browse verified harvest listings directly from farmers.
          </p>
        </div>
        <span className="text-sm font-semibold text-soil">
          {pagination.total} Available Listings
        </span>
      </div>

      {/* Filter Bar */}
      <div className="my-6 grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        <input
          className="field"
          placeholder="Search crop (e.g. Wheat)"
          value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)}
        />
        <select
          className="field"
          value={filters.state}
          onChange={(e) => setFilter("state", e.target.value)}
        >
          <option value="">All States</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="field"
          value={filters.district}
          onChange={(e) => setFilter("district", e.target.value)}
        >
          <option value="">All Districts</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <input
          className="field"
          type="number"
          placeholder="Min price"
          value={filters.minPrice}
          onChange={(e) => setFilter("minPrice", e.target.value)}
        />
        <input
          className="field"
          type="number"
          placeholder="Max price"
          value={filters.maxPrice}
          onChange={(e) => setFilter("maxPrice", e.target.value)}
        />
      </div>

      <div className="mb-6">
        <MandiChart />
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm font-semibold text-soil">
          Loading marketplace harvests...
        </div>
      ) : listings.length ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                disabled={pagination.page <= 1}
                onClick={() => changePage(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm font-semibold text-soil">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="secondary"
                disabled={pagination.page >= pagination.pages}
                onClick={() => changePage(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No listings found"
          text="Try adjusting your search criteria or price filters."
        />
      )}
    </section>
  );
}
