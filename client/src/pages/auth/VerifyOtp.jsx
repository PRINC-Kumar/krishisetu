import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/common/Button.jsx";
import { authApi } from "../../api/authApi.js";
import { useAuth } from "../../hooks/useAuth.js";

export default function VerifyOtp() {
  const phone = useLocation().state?.phone || "";
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser } = useAuth();
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
      const res = await authApi.verifyOtp({ phone, otp });
      setUser(res.data);
      // res.data contains { ...user fields, accessToken }
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
        <h1 className="font-heading text-3xl text-leaf">Verify OTP</h1>
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
