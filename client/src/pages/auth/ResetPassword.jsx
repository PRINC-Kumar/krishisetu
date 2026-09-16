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
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(form);
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
        Enter the reset token generated for your account along with your new password.
      </p>
      <div>
        <label className="text-xs font-semibold text-soil">Reset Token</label>
        <input
          className="field mt-1"
          placeholder="Paste reset token here"
          value={form.token}
          onChange={(e) => setForm({ ...form, token: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-soil">New Password</label>
        <input
          className="field mt-1"
          type="password"
          placeholder="New password (min 6 chars)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
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
