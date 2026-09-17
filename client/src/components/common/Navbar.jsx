import { Link, NavLink, useNavigate } from "react-router-dom";
import { Leaf, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import Button from "./Button.jsx";

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const homeRoute =
    role === "farmer"
      ? "/farmer/dashboard"
      : role === "buyer"
        ? "/buyer/marketplace"
        : role === "admin"
          ? "/admin/dashboard"
          : "/login";

  const roleLinks =
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

  const publicLinks = [
    ["/", "Home"],
    ["/buyer/marketplace", "Marketplace"],
  ];
  const links = user ? roleLinks : publicLinks;

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
        <button
          type="button"
          className="text-leaf md:hidden"
          aria-label="Toggle navigation menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <div className={`${menuOpen ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-3 border-b border-grove/10 bg-cream px-4 py-4 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}>
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                label === "Home"
                  ? "text-sm font-semibold text-soil transition hover:text-leaf"
                  : `text-sm font-semibold transition ${
                      isActive ? "text-leaf underline" : "text-soil hover:text-leaf"
                    }`
              }
            >
              {label}
            </NavLink>
          ))}

          {user ? (
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <span className="hidden rounded-full bg-cream px-3 py-1 text-xs font-bold capitalize text-leaf md:inline">
                {user.name} ({role})
              </span>
              <Button
                variant="secondary"
                className="flex items-center gap-2 py-2 text-xs"
                onClick={async () => {
                  setMenuOpen(false);
                  await logout();
                  navigate("/login");
                }}
              >
                <LogOut size={14} />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl bg-leaf px-4 py-2 text-xs font-semibold text-white transition hover:bg-grove"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl bg-leaf px-4 py-2 text-xs font-semibold text-white hover:bg-grove transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
        </div>
      </nav>
    </header>
  );
}
