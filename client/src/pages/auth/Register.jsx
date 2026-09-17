import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/common/Button.jsx";
import { authApi } from "../../api/authApi.js";
import { districtsByState, states } from "../../utils/constants.js";

export default function Register() {
  const [role, setRole] = useState("farmer");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    farmSize: "",
    location: { state: "", district: "" },
  });

  const navigate = useNavigate();
  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        role,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        businessName: role === "buyer" ? form.businessName : undefined,
        farmSize: role === "farmer" ? form.farmSize : undefined,
        location: form.location,
      };

      const res = await authApi.register(payload);
      toast.success(
        role === "farmer"
          ? "Registration successful! Admin approval pending. You can now log in."
          : "Registration successful! You can now log in.",
      );
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2">
      <div>
        <h1 className="font-heading text-5xl text-leaf">KrishiSetu</h1>
        <p className="mt-4 text-lg text-soil">
          A direct bridge between farmers and verified buyers.
        </p>
        <img
          className="mt-8 h-80 w-full rounded-2xl object-cover shadow"
          src="https://images.pexels.com/photos/38453521/pexels-photo-38453521.jpeg?auto=compress&cs=tinysrgb&w=1100"
          alt="Farmland"
        />
      </div>

      <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-heading text-2xl text-leaf">Create an Account</h2>
        <p className="mb-4 text-xs text-soil">Select your role to get started</p>

        <div className="mb-5 grid grid-cols-2 rounded-2xl bg-cream p-1">
          {["farmer", "buyer"].map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRole(r)}
              className={`rounded-2xl py-3 text-sm font-bold capitalize transition ${
                role === r ? "bg-leaf text-white shadow-sm" : "text-soil hover:text-leaf"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          <div>
            <label className="text-xs font-semibold text-soil">Full Name</label>
            <input
              className="field mt-1"
              placeholder="e.g. Ramesh Kumar"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-soil">Email Address</label>
              <input
                className="field mt-1"
                placeholder="e.g. user@example.com"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-soil">Phone Number</label>
              <input
                className="field mt-1"
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-soil">Password</label>
              <input
                className="field mt-1"
                placeholder="Min 6 characters"
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-soil">Confirm Password</label>
              <input
                className="field mt-1"
                placeholder="Re-enter password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                required
              />
            </div>
          </div>

          {role === "buyer" && (
            <div>
              <label className="text-xs font-semibold text-soil">Business Name (Optional)</label>
              <input
                className="field mt-1"
                placeholder="e.g. Agro Supplies Ltd"
                value={form.businessName}
                onChange={(e) => set("businessName", e.target.value)}
              />
            </div>
          )}

          {role === "farmer" && (
            <div>
              <label className="text-xs font-semibold text-soil">Farm Size (Optional)</label>
              <input
                className="field mt-1"
                placeholder="e.g. 5 Acres"
                value={form.farmSize}
                onChange={(e) => set("farmSize", e.target.value)}
              />
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-soil">State</label>
              <select
                className="field mt-1"
                value={form.location.state}
                onChange={(e) => set("location", { state: e.target.value, district: "" })}
                required
              >
                <option value="">Select state</option>
                {states.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-soil">District</label>
              <select
                className="field mt-1"
                value={form.location.district}
                disabled={!form.location.state}
                onChange={(e) =>
                  set("location", { ...form.location, district: e.target.value })
                }
                required
              >
                <option value="">
                  {form.location.state ? "Select district" : "Select state first"}
                </option>
                {(districtsByState[form.location.state] || []).map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <Button className="mt-2" disabled={loading}>
            {loading ? "Registering..." : `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </Button>

          <div className="mt-3 text-center">
            <Link className="text-sm font-semibold text-soil hover:text-leaf" to="/login">
              Already have an account? <span className="text-leaf underline">Login</span>
            </Link>
          </div>
        </div>
      </form>
    </section>
  );
}
