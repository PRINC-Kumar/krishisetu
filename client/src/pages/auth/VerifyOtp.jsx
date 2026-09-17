import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/common/Button.jsx";
import { authApi } from "../../api/authApi.js";
import { useAuth } from "../../hooks/useAuth.js";

export default function VerifyOtp() {
  const location = useLocation();
  const isPasswordReset = location.state?.passwordReset;
  const phone = location.state?.phone || "";
  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(isPasswordReset ? 60 : 30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (otp.length === 6 && !isSubmitting) submit();
  }, [otp]);
  const submit = async () => {
    if (otp.length !== 6 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (isPasswordReset) {
        const res = await authApi.verifyPasswordResetOtp({ email, otp });
        toast.success("OTP verified");
        navigate("/reset-password", { state: { token: res.data.resetToken } });
        return;
      }

      const res = await authApi.verifyOtp({ phone, otp });
      const { accessToken, ...userData } = res.data;
      login(userData, accessToken);
      toast.success("OTP verified");
      navigate("/farmer/dashboard");
    } catch (error) {
      toast.error(error.message || "OTP verification failed");
      setOtp("");
    } finally {
      setIsSubmitting(false);
    }
  };
  const resend = async () => {
    try {
      if (isPasswordReset) {
        await authApi.forgotPassword({ email });
        setCooldown(60);
        toast.success("If account exists, OTP sent.");
        return;
      }

      const res = await authApi.requestOtp({ phone });
      setCooldown(30);
      toast.success(`OTP sent: ${res.data.devOtp}`);
    } catch (error) {
      toast.error(error.message || "Could not resend OTP");
    }
  };
  return (
    <section className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="font-heading text-3xl text-leaf">
          {isPasswordReset ? "Verify Reset OTP" : "Verify OTP"}
        </h1>
        {isPasswordReset && <p className="mt-2 text-sm text-soil">Enter the 6-digit code sent to your email address.</p>}
        <input
          className="field mt-6 text-center text-2xl tracking-[0.4em]"
          maxLength="6"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        />
        <Button className="mt-4 w-full" onClick={submit}>
          Verify
        </Button>
        <button
          className="mt-4 text-sm font-semibold text-grove disabled:text-soil/50"
          disabled={cooldown > 0 || isSubmitting}
          onClick={resend}
        >
          Resend OTP {cooldown > 0 && `in ${cooldown}s`}
        </button>
      </div>
    </section>
  );
}
