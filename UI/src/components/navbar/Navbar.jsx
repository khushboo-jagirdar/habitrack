import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "./navbar.scss";

const PROPERTY_LINKS = [
  { label: "All Properties", to: "/list", icon: "🏘️" },
  { label: "Buy a Home", to: "/list?type=buy", icon: "🏠" },
  { label: "Rent a Home", to: "/list?type=rent", icon: "🔑" },
  { label: "Apartments", to: "/list?propertyType=apartment", icon: "🏢" },
  { label: "Houses", to: "/list?propertyType=house", icon: "🏡" },
  { label: "Land / Plots", to: "/list?propertyType=land", icon: "🌿" },
  { label: "Delhi", to: "/list?location=Delhi", icon: "📍" },
  { label: "Gurugram", to: "/list?location=Gurugram", icon: "📍" },
  { label: "Noida", to: "/list?location=Noida", icon: "📍" },
  { label: "Mathura", to: "/list?location=Mathura", icon: "📍" },
  { label: "Agra", to: "/list?location=Agra", icon: "📍" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [propOpen, setPropOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const propRef = useRef(null);

  const apiBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, "")
    : "";

  useEffect(() => {
    setProfileOpen(false);
    setMenuOpen(false);
    setPropOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (propRef.current && !propRef.current.contains(e.target)) {
        setPropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMenuOpen(false);
    toast.info("You have been signed out.");
    navigate("/signin");
  };

  const avatarSrc =
    user?.avatar && user.avatar !== ""
      ? user.avatar.startsWith("/uploads")
        ? `${apiBase}${user.avatar}`
        : user.avatar
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "U")}&background=008080&color=fff&size=64`;

  return (
    <nav>
      <div className="left">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="HabiTrack" />
          <span>HabiTrack</span>
        </Link>
        <Link to="/">Home</Link>
        <Link to="/about">About us</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/agents">Agents</Link>
        <Link to="/list">Properties</Link>
      </div>

      <div className="right">
        {user ? (
          <div className="user" ref={dropdownRef}>
            <button
              className="userTrigger"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
              type="button"
            >
              <img src={avatarSrc} alt={user.fullName} />
              <span>{user.fullName}</span>
            </button>

            {profileOpen && (
              <div className="profileDropdown">
                <div className="profileRow">
                  <strong>{user.fullName}</strong>
                  <small className={`roleTag role-${user.userType}`}>{user.userType}</small>
                </div>
                <div className="profileRow email">{user.email}</div>

                {user.aadhaarVerified ? (
                  <div className="aadhaarBadge">🪪 Aadhaar Verified</div>
                ) : (
                  <Link to="/verify-aadhaar" className="aadhaarLink" onClick={() => setProfileOpen(false)}>
                    🪪 Verify Aadhaar
                  </Link>
                )}

                <Link to="/profile" className="profileLink" onClick={() => setProfileOpen(false)}>
                  👤 View Profile
                </Link>

                {user.isAdmin && (
                  <Link to="/admin/dashboard" className="profileLink adminLink" onClick={() => setProfileOpen(false)}>
                    🛡️ Admin Panel
                  </Link>
                )}

                <button className="dropdownLogout" onClick={handleLogout}>
                  🚪 Sign Out
                </button>
              </div>
            )}

            <button className="logoutBtn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link to="/signin" className="signIn">Sign in</Link>
            <Link to="/signup" className="register">Sign up</Link>
          </>
        )}

        <div className="menuIcon">
          <img
            src="/menu.png"
            alt="Menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          />
        </div>

        <div className={menuOpen ? "menu active" : "menu"}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About us</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link to="/agents" onClick={() => setMenuOpen(false)}>Agents</Link>
          <Link to="/list" onClick={() => setMenuOpen(false)}>🏘️ Properties</Link>
          <Link to="/list?type=buy" onClick={() => setMenuOpen(false)}>🏠 Buy</Link>
          <Link to="/list?type=rent" onClick={() => setMenuOpen(false)}>🔑 Rent</Link>

          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              {!user.aadhaarVerified && (
                <Link to="/verify-aadhaar" onClick={() => setMenuOpen(false)}>Verify Aadhaar</Link>
              )}
              {user.isAdmin && (
                <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
              )}
              <button onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/signin" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
