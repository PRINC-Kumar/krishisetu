import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/common/Navbar.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import RoleBasedRoute from "./RoleBasedRoute.jsx";
import Loader from "../components/common/Loader.jsx";
import { useAuth } from "../hooks/useAuth.js";
import Register from "../pages/auth/Register.jsx";
import Login from "../pages/auth/Login.jsx";
import VerifyOtp from "../pages/auth/VerifyOtp.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import ResetPassword from "../pages/auth/ResetPassword.jsx";
import NotAuthorized from "../pages/auth/NotAuthorized.jsx";
import FarmerDashboard from "../pages/farmer/FarmerDashboard.jsx";
import CreateListing from "../pages/farmer/CreateListing.jsx";
import FarmerOrders from "../pages/farmer/FarmerOrders.jsx";
import Marketplace from "../pages/buyer/Marketplace.jsx";
import ListingDetail from "../pages/buyer/ListingDetail.jsx";
import BuyerOrders from "../pages/buyer/BuyerOrders.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import ManageUsers from "../pages/admin/ManageUsers.jsx";
import AdminListings from "../pages/admin/AdminListings.jsx";
import Disputes from "../pages/admin/Disputes.jsx";
import Home from "../pages/Home.jsx";

function HomeRedirect() {
  const { user, role, isLoading } = useAuth();
  if (isLoading) return <Loader />;
  if (!user) return <Home />;
  if (role === "farmer") return <Navigate to="/farmer/dashboard" replace />;
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/buyer/marketplace" replace />;
}

export default function AppRoutes() {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          <Routes location={location}>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login/farmer/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/forgot-password/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/not-authorized" element={<NotAuthorized />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<RoleBasedRoute allowedRoles={["farmer"]} />}>
                <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
                <Route
                  path="/farmer/listings/new"
                  element={<CreateListing />}
                />
                <Route path="/farmer/orders" element={<FarmerOrders />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={["buyer"]} />}>
                <Route path="/buyer/marketplace" element={<Marketplace />} />
                <Route path="/buyer/listings/:id" element={<ListingDetail />} />
                <Route path="/buyer/orders" element={<BuyerOrders />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/listings" element={<AdminListings />} />
                <Route path="/admin/disputes" element={<Disputes />} />
              </Route>
            </Route>
          </Routes>
        </motion.main>
      </AnimatePresence>
    </>
  );
}
