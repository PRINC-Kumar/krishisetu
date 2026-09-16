import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/common/Button.jsx";
import { authApi } from "../../api/authApi.js";
import { useAuth } from "../../hooks/useAuth.js";

export default function Login() {
  const [role, setRole] = useState("farmer");
  const [mode, setMode] = useState("password"); // "password" or "otp"
  const [form, setForm] = useState({ email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  const redirectByRole = (userRole) => {
    if (userRole === "farmer") navigate("/farmer/dashboard");
    else if (userRole === "admin") navigate("/admin/dashboard");
    else navigate("/buyer/marketplace");
  };

  // Redirect already authenticated users away from the login page
  useEffect(() => {
    if (user) {
      redirectByRole(user.role);
    }
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "otp") {
        if (!form.phone?.trim()) {
          toast.error("Please enter your phone number");
          setLoading(false);
          return;
        }
        const res = await authApi.requestOtp({ phone: form.phone.trim() });
        toast.success(`OTP sent: ${res.data.devOtp}`);
        navigate("/login/farmer/verify-otp", { state: { phone: form.phone.trim() } });
        return;
      }

      // Password login with role validation
      const res = await authApi.login({
        email: form.email.trim(),
        password: form.password,
        role,
      });

      login(res.data, res.data.accessToken);
      toast.success("Welcome back, " + (res.data.name || "User"));
      redirectByRole(res.data.role);
    } catch (error) {
      toast.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2">
      <img
        className="h-[520px] w-full rounded-2xl object-cover shadow"
        src="https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1200&q=80"
        alt="Agriculture"
      />
      <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="font-heading text-3xl text-leaf">Login to KrishiSetu</h1>
        <p className="mt-1 text-sm text-soil">
          Select your role and enter your credentials.
        </p>

        {/* Role Selection: Farmer, Buyer, Admin */}
        <div className="my-5 grid grid-cols-3 rounded-2xl bg-cream p-1">
          {["farmer", "buyer", "admin"].map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => {
                setRole(r);
                if (r !== "farmer") setMode("password");
              }}
              className={`rounded-2xl py-3 text-xs md:text-sm font-bold capitalize transition ${
                role === r ? "bg-leaf text-white shadow-sm" : "text-soil hover:text-leaf"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Farmer optional login mode toggle (Password vs OTP) */}
        {role === "farmer" && (
          <div className="mb-4 flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setMode("password")}
              className={`font-semibold ${mode === "password" ? "text-leaf underline" : "text-soil"}`}
            >
              Password Login
            </button>
            <span className="text-soil">|</span>
            <button
              type="button"
              onClick={() => setMode("otp")}
              className={`font-semibold ${mode === "otp" ? "text-leaf underline" : "text-soil"}`}
            >
              OTP Login
            </button>
          </div>
        )}

        {mode === "password" ? (
          <div className="grid gap-4">
            <div>
              <label className="text-xs font-semibold text-soil">Email Address</label>
              <input
                className="field mt-1"
                type="email"
                placeholder="e.g. name@krishisetu.test"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-soil">Password</label>
              <input
                className="field mt-1"
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <Button disabled={loading}>
              {loading ? "Logging in..." : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </Button>
            <Link
              className="text-sm font-semibold text-grove hover:underline"
              to="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            <div>
              <label className="text-xs font-semibold text-soil">Registered Phone Number</label>
              <input
                className="field mt-1"
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <Button disabled={loading}>
              {loading ? "Sending OTP..." : "Send Login OTP"}
            </Button>
          </div>
        )}

        <div className="mt-5 border-t border-cream pt-4 text-center">
          <Link className="text-sm font-semibold text-soil hover:text-leaf" to="/register">
            New here? <span className="text-leaf underline">Create an account</span>
          </Link>
        </div>
      </form>
    </section>
  );
}
