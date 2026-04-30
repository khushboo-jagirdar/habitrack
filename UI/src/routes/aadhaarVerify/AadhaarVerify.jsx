import { useState } from "react";
import { sendAadhaarOtp, verifyAadhaarOtp } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./aadhaarVerify.scss";

function AadhaarVerify() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = enter aadhaar, 2 = enter OTP
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState(""); // shown in dev mode
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate("/signin");
    return null;
  }

  if (user.aadhaarVerified) {
    return (
      <div className="aadhaarVerify">
        <div className="aadhaarContainer">
          <div className="verifiedBadge">
            <span className="checkIcon">✓</span>
            <h2>Aadhaar Verified</h2>
            <p>Your Aadhaar identity has already been verified.</p>
            <button onClick={() => navigate("/profile")}>Go to Profile</button>
          </div>
        </div>
      </div>
    );
  }

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      setError("Please enter a valid 12-digit Aadhaar number.");
      return;
    }
    setLoading(true);
    try {
      const result = await sendAadhaarOtp(aadhaarNumber, user.id);
      setDevOtp(result.devOtp || "");
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      await verifyAadhaarOtp(otp, user.id);
      updateUser({ aadhaarVerified: true });
      setSuccess("Aadhaar verified successfully!");
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aadhaarVerify">
      <div className="aadhaarContainer">
        <div className="aadhaarHeader">
          <div className="aadhaarLogo">🪪</div>
          <h1>Aadhaar Verification</h1>
          <p>Verify your identity using your Aadhaar number</p>
        </div>

        <div className="steps">
          <div className={`step ${step >= 1 ? "active" : ""}`}>
            <span>1</span> Enter Aadhaar
          </div>
          <div className="stepLine" />
          <div className={`step ${step >= 2 ? "active" : ""}`}>
            <span>2</span> Verify OTP
          </div>
        </div>

        {error && <div className="errorMessage">{error}</div>}
        {success && <div className="successMessage">{success}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="formGroup">
              <label htmlFor="aadhaar">Aadhaar Number</label>
              <input
                type="text"
                id="aadhaar"
                placeholder="Enter 12-digit Aadhaar number"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                maxLength={12}
                required
              />
              <small>Your Aadhaar number is 12 digits printed on your Aadhaar card</small>
            </div>
            <div className="disclaimer">
              <p>🔒 Your Aadhaar data is encrypted and stored securely. We only verify your identity and do not share your data with third parties.</p>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="formGroup">
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
              />
              <small>OTP sent to your mobile number linked with Aadhaar</small>
            </div>
            {devOtp && (
              <div className="devNote">
                <strong>Dev Mode OTP:</strong> {devOtp}
              </div>
            )}
            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              className="resendBtn"
              onClick={() => { setStep(1); setOtp(""); setError(""); }}
            >
              ← Change Aadhaar Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AadhaarVerify;

