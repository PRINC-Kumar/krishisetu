import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/common/Button.jsx";
import { authApi } from "../../api/authApi.js";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    token: location.state?.token || "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(form.password)) {
      toast.error("Use 8+ characters with upper, lower, number, and special character");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        resetToken: form.token,
        newPassword: form.password,
      });
      toast.success("Password reset successfully! Please log in.");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-20 grid max-w-md gap-4 rounded-2xl bg-white p-6 shadow-sm"
    >
      <h1 className="font-heading text-3xl text-leaf">Reset Password</h1>
      <p className="text-sm text-soil">
        Choose a strong new password for your account.
      </p>
      <div>
        <input type="hidden" value={form.token} readOnly />
      </div>
      <div>
        <label className="text-xs font-semibold text-soil">New Password</label>
        <input
          className="field mt-1"
          type="password"
          placeholder="8+ chars with upper, lower, number, and symbol"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-soil">Confirm New Password</label>
        <input
          className="field mt-1"
          type="password"
          placeholder="Re-enter your new password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          required
        />
      </div>
      <Button disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
      <div className="text-center">
        <Link className="text-sm font-semibold text-soil hover:text-leaf" to="/login">
          Back to Login
        </Link>
      </div>
    </form>
  );
}
