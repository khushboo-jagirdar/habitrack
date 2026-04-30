import { useState, useEffect } from "react";
import { loginUser, adminLogin } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./SignIn.scss";

function SignIn() {
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [mode, setMode] = useState("user"); // "user" | "admin"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(user.isAdmin ? "/admin/dashboard" : "/", { replace: true });
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }
    try {
      const result = mode === "admin"
        ? await adminLogin(formData)
        : await loginUser(formData);
      login(result.user, result.token);
      if (mode === "admin") {
        toast.success("Welcome, Administrator!");
        navigate("/admin/dashboard");
      } else {
        toast.success(`Welcome back, ${result.user.fullName}! 👋`);
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Sign in failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signIn">
      <div className="signInContainer">

        {/* ── Left: Form ── */}
        <div className="left">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="HabiTrack" />
            <span>HabiTrack</span>
          </Link>

          {/* Mode toggle */}
          <div className="modeToggle">
            <button
              className={mode === "user" ? "active" : ""}
              onClick={() => { setMode("user"); setError(""); }}
              type="button"
            >
              👤 User Login
            </button>
            <button
              className={mode === "admin" ? "active" : ""}
              onClick={() => { setMode("admin"); setError(""); }}
              type="button"
            >
              🛡️ Admin Login
            </button>
          </div>

          <div className="si-heading">
            <h1>{mode === "admin" ? "Admin Portal" : "Welcome Back"}</h1>
            <p>{mode === "admin" ? "Sign in to the HabiTrack admin panel" : "Sign in to continue your property search"}</p>
          </div>

          {error && <div className="errorMessage">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="formGroup">
              <label htmlFor="email">{mode === "admin" ? "Admin Email" : "Email Address"}</label>
              <div className="inputWrap">
                <span className="inputIcon">✉️</span>
                <input
                  type="email" id="email" name="email"
                  placeholder={mode === "admin" ? "admin@habittrack.com" : "you@example.com"}
                  value={formData.email} onChange={handleChange}
                />
              </div>
            </div>

            <div className="formGroup">
              <label htmlFor="password">Password</label>
              <div className="inputWrap">
                <span className="inputIcon">🔒</span>
                <input
                  type="password" id="password" name="password"
                  placeholder="Enter your password"
                  value={formData.password} onChange={handleChange}
                />
              </div>
            </div>

            {mode === "user" && (
              <div className="options">
                <label className="remember">
                  <input type="checkbox" /> Remember me
                </label>
                <Link to="/forgot-password" className="forgotPassword">Forgot password?</Link>
              </div>
            )}

            <button
              type="submit"
              className={`signInButton ${mode === "admin" ? "adminBtn" : ""}`}
              disabled={loading}
            >
              {loading ? "Signing In..." : mode === "admin" ? "Sign In as Admin →" : "Sign In →"}
            </button>
          </form>

          {mode === "user" && (
            <div className="signupLink">
              Don&apos;t have an account? <Link to="/signup">Create one free</Link>
            </div>
          )}
        </div>

        {/* ── Right: Visual ── */}
        <div className="right">
          <div className="imageContainer">
            <img src="/bg.png" alt="Modern property" />
            <div className={`overlay ${mode === "admin" ? "adminOverlay" : ""}`}>
              <div className="si-brand">
                <span>HabiTrack</span>
                <span>{mode === "admin" ? "Administration" : "India's #1 Property Platform"}</span>
              </div>
              {mode === "admin" ? (
                <>
                  <h2>Admin Control Center</h2>
                  <p>Manage users, properties, Aadhaar verifications and transactions from one place.</p>
                  <div className="si-features">
                    {["User management", "Aadhaar verification control", "Property oversight", "Transaction monitoring"].map(f => (
                      <div className="si-feature" key={f}>
                        <span className="si-check">✓</span>{f}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h2>Find Your Perfect Home Across India</h2>
                  <p>Thousands of Aadhaar-verified listings. Expert agents. Secure transactions.</p>
                  <div className="si-stats">
                    <div className="si-stat"><strong>15K+</strong><span>Properties</span></div>
                    <div className="si-stat"><strong>200+</strong><span>Agents</span></div>
                    <div className="si-stat"><strong>98%</strong><span>Satisfaction</span></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SignIn;

