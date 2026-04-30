import { useState } from "react";
import { adminLogin } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./admin.scss";

function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await adminLogin(formData);
      login(result.user, result.token);
      toast.success("Welcome, Administrator!");
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Invalid admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adminLogin">
      <div className="adminLoginBox">
        <div className="adminIcon">🛡️</div>
        <h1>Admin Portal</h1>
        <p>HabiTrack Administration</p>

        {error && <div className="errorMessage">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label>Admin Email</label>
            <input type="email" placeholder="admin@habittrack.com"
              value={formData.email}
              onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setError(""); }}
              required />
          </div>
          <div className="formGroup">
            <label>Password</label>
            <input type="password" placeholder="Enter admin password"
              value={formData.password}
              onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setError(""); }}
              required />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;

