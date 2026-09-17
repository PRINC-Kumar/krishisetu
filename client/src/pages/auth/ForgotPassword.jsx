import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/common/Button.jsx";
import { authApi } from "../../api/authApi.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim().toLowerCase() });
      toast.success("If account exists, OTP sent.");
      navigate("/forgot-password/verify-otp", {
        state: { email: email.trim().toLowerCase(), passwordReset: true },
      });
    } catch (error) {
      toast.error(error.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-20 grid max-w-md gap-4 rounded-2xl bg-white p-6 shadow-sm"
    >
      <h1 className="font-heading text-3xl text-leaf">Forgot Password</h1>
      <p className="text-sm text-soil">
        Enter your registered email address to receive a password reset OTP.
      </p>
      <div>
        <label className="text-xs font-semibold text-soil">Registered Email Address</label>
        <input
          className="field mt-1"
          type="email"
          placeholder="e.g. user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button disabled={loading}>
        {loading ? "Sending..." : "Send OTP"}
      </Button>
      <div className="text-center">
        <Link className="text-sm font-semibold text-soil hover:text-leaf" to="/login">
          Back to Login
        </Link>
      </div>
    </form>
  );
}
