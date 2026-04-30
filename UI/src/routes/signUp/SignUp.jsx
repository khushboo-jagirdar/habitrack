import { useState, useEffect } from "react";
import { registerUser, sendAadhaarOtp, verifyAadhaarOtp } from "../../lib/api";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import "./SignUp.scss";

function SignUp() {
  const navigate = useNavigate();
  const { login, user, updateUser } = useAuth();
  const [registrationDone, setRegistrationDone] = useState(false);

  // Already logged in ? go home (but not if we just registered and are in Aadhaar steps)
  useEffect(() => {
    if (user && !registrationDone) navigate("/", { replace: true });
  }, [user, navigate, registrationDone]);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "buyer",
  });
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Step 1: Register account
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!termsAccepted) {
      setError("Please accept the Terms of Service to continue.");
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
      });
      // Auto-login immediately after account creation
      setRegistrationDone(true);
      login(result.user, result.token);
      setUserId(result.userId || result.user?.id || result.user?._id);
      toast.success(`?? Welcome, ${result.user.fullName}! Account created.`);
      setStep(2);
    } catch (err) {
      const msg = err.message || "Sign up failed. Please try again.";
      setError(msg.includes("already exists") ? "This email is already registered. Try signing in instead." : msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Send Aadhaar OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      setError("Please enter a valid 12-digit Aadhaar number.");
      return;
    }
    setLoading(true);
    try {
      const result = await sendAadhaarOtp(aadhaarNumber, userId);
      setDevOtp(result.devOtp || "");
      toast.info("OTP sent to your Aadhaar-linked mobile number.");
      setStep(3);
    } catch (err) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      await verifyAadhaarOtp(otp, userId);
      updateUser({ aadhaarVerified: true });
      setRegistrationDone(false);
      toast.success("? Aadhaar verified! Taking you home...");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="signUp">
      <div className="signUpContainer">
        <div className="left">
          <div className="logo">
            <img src="/logo.png" alt="HabiTrack" />
            <span>HabiTrack</span>
          </div>
          <div className="signupSteps">
            <div className={`signupStep ${step >= 1 ? "active" : ""} ${step > 1 ? "done" : ""}`}>
              <span>1</span> Account
            </div>
            <div className="stepLine" />
            <div className={`signupStep ${step >= 2 ? "active" : ""} ${step > 2 ? "done" : ""}`}>
              <span>2</span> Aadhaar
            </div>
            <div className="stepLine" />
            <div className={`signupStep ${step >= 3 ? "active" : ""}`}>
              <span>3</span> Verify OTP
            </div>
          </div>

          {error && <div className="errorMessage">{error}</div>}

          {/* -- Step 1: Account details -- */}
          {step === 1 && (
            <>
              <h1>Create Account</h1>
              <p>Join HabiTrack and start your property journey</p>
              <form onSubmit={handleRegister} noValidate>
                <div className="formGroup">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div className="formGroup">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="formGroup">
                  <label htmlFor="userType">I am a</label>
                  <select id="userType" name="userType" value={formData.userType} onChange={handleChange}>
                    <option value="buyer">Buyer / Renter</option>
                    <option value="agent">Property Agent</option>
                    <option value="owner">Property Owner</option>
                  </select>
                </div>
                <div className="formGroup">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <div className="formGroup">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                <div className="terms">
                  <label className="agree">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => { setTermsAccepted(e.target.checked); setError(""); }}
                    />
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </div>
                <button type="submit" className="signUpButton" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
              <div className="signinLink">
                Already have an account? <Link to="/signin">Sign in</Link>
              </div>
            </>
          )}

          {/* -- Step 2: Aadhaar number -- */}
          {step === 2 && (
            <>
              <h1>Verify Aadhaar</h1>
              <p>Aadhaar verification is required to complete your registration</p>
              <form onSubmit={handleSendOtp} noValidate>
                <div className="formGroup">
                  <label htmlFor="aadhaar">Aadhaar Number</label>
                  <input
                    type="text"
                    id="aadhaar"
                    placeholder="Enter 12-digit Aadhaar number"
                    value={aadhaarNumber}
                    onChange={(e) => {
                      setAadhaarNumber(e.target.value.replace(/\D/g, "").slice(0, 12));
                      setError("");
                    }}
                    maxLength={12}
                  />
                  <small>?? Your Aadhaar data is encrypted and stored securely.</small>
                </div>
                <button type="submit" className="signUpButton" disabled={loading}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            </>
          )}

          {/* -- Step 3: OTP verification -- */}
          {step === 3 && (
            <>
              <h1>Enter OTP</h1>
              <p>OTP sent to your Aadhaar-linked mobile number</p>
              {devOtp && (
                <div className="devNote">
                  <strong>Dev Mode OTP:</strong> {devOtp}
                </div>
              )}
              <form onSubmit={handleVerifyOtp} noValidate>
                <div className="formGroup">
                  <label htmlFor="otp">6-digit OTP</label>
                  <input
                    type="text"
                    id="otp"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setError("");
                    }}
                    maxLength={6}
                  />
                </div>
                <button type="submit" className="signUpButton" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Complete"}
                </button>
              </form>
              <button className="skipBtn" onClick={() => { setStep(2); setOtp(""); setError(""); }}>
                ? Change Aadhaar Number
              </button>
            </>
          )}
        </div>

        <div className="right">
          <div className="imageContainer">
            <img src="/bg.png" alt="Modern Interior" />
            <div className="overlay">
              <div className="su-brand">
                <span>HabiTrack</span>
                <span>India's #1 Property Platform</span>
              </div>
              <h2>Start Your Property Journey Today</h2>
              <p>Join 50,000+ verified buyers, owners and agents on India's most trusted real estate platform.</p>
              <div className="su-features">
                {["Aadhaar-verified listings", "Secure transactions", "Expert agent network", "Free to browse & list"].map(f => (
                  <div className="su-feature" key={f}>
                    <span className="su-check">?</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;

