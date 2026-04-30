import { useState } from "react";
import { resetPassword } from "../../lib/api";
import { Link } from "react-router-dom";
import "./forgotPassword.scss";

function ForgotPassword() {
  const [formData, setFormData] = useState({ email: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.email || !formData.newPassword || !formData.confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await resetPassword({ email: formData.email, newPassword: formData.newPassword });
      setSuccess("Password reset successful. You can now sign in.");
      setFormData({ email: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgotPassword">
      <div className="forgotContainer">
        <h1>Forgot Password</h1>
        <p>Enter your email and a new password to reset your account.</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="errorMessage">{error}</div>}
          {success && <div className="successMessage">{success}</div>}

          <div className="formGroup">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="Enter a new password"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="resetButton" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="backToSignIn">
          Remembered your password? <Link to="/signin">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

