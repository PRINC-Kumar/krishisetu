import { Link, NavLink, useNavigate } from "react-router-dom";
import { Leaf, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import Button from "./Button.jsx";

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const homeRoute =
    role === "farmer"
      ? "/farmer/dashboard"
      : role === "buyer"
        ? "/buyer/marketplace"
        : role === "admin"
          ? "/admin/dashboard"
          : "/login";

  const links =
    role === "farmer"
      ? [
          ["/farmer/dashboard", "Dashboard"],
          ["/farmer/listings/new", "Create Listing"],
          ["/farmer/orders", "Orders"],
        ]
      : role === "buyer"
        ? [
            ["/buyer/marketplace", "Marketplace"],
            ["/buyer/orders", "My Orders"],
          ]
        : role === "admin"
          ? [
              ["/admin/dashboard", "Dashboard"],
              ["/admin/users", "Users"],
              ["/admin/listings", "Listings"],
              ["/admin/disputes", "Disputes"],
            ]
          : [];

  return (
    <header className="sticky top-0 z-10 border-b border-grove/10 bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          to={homeRoute}
          className="flex items-center gap-2 font-heading text-xl text-leaf"
        >
          <Leaf />
          KrishiSetu
        </Link>

        <div className="flex items-center gap-3">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm font-semibold transition ${
                  isActive ? "text-leaf underline" : "text-soil hover:text-leaf"
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden rounded-full bg-cream px-3 py-1 text-xs font-bold capitalize text-leaf md:inline">
                {user.name} ({role})
              </span>
              <Button
                variant="secondary"
                className="flex items-center gap-2 py-2 text-xs"
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
              >
                <LogOut size={14} />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-leaf hover:underline">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-2xl bg-leaf px-4 py-2 text-xs font-semibold text-white hover:bg-grove transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
