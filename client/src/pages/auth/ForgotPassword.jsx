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
      const res = await authApi.forgotPassword({ email: email.trim() });
      toast.success(`Reset token generated: ${res.data.resetToken}`);
      navigate("/reset-password", { state: { token: res.data.resetToken } });
    } catch (error) {
      toast.error(error.message || "Failed to generate reset token");
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
        Enter your registered email address to generate a password reset token.
      </p>
      <div>
        <label className="text-xs font-semibold text-soil">Account Email</label>
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
        {loading ? "Generating..." : "Create Reset Token"}
      </Button>
      <div className="text-center">
        <Link className="text-sm font-semibold text-soil hover:text-leaf" to="/login">
          Back to Login
        </Link>
      </div>
    </form>
  );
}
