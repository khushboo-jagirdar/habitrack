import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import LeafletMap from "../../components/map/LeafletMap";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchPropertyById, verifyProperty } from "../../lib/propertyApi";
import { fetchUserById, saveProperty, unsaveProperty, getSavedProperties } from "../../lib/userApi";
import { createThread } from "../../lib/chatApi";
import { processTransaction } from "../../lib/transactionApi";
import { getMainLocationName } from "../../lib/locationFormatter";
import { useAuth } from "../../context/AuthContext";

function SinglePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    // Normalize id: MongoDB uses _id
    const currentUser = authUser ? { ...authUser, id: authUser.id || authUser._id } : null;
    const [property, setProperty] = useState(null);
    const [owner, setOwner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Message modal state
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState("");
    const [sendSuccess, setSendSuccess] = useState(false);

    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifyError, setVerifyError] = useState("");
    const [verifyMessage, setVerifyMessage] = useState("");

    // Save property state
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    // Payment modal state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentType, setPaymentType] = useState(null);
    const [paymentData, setPaymentData] = useState({
      cardNumber: "",
      cardHolder: "",
      expiryDate: "",
      cvv: "",
    });
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentError, setPaymentError] = useState("");
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError("");
        fetchPropertyById(id)
            .then((data) => {
                if (!isMounted) return;
                setProperty(data);
                if (data?.ownerId) {
                    fetchUserById(data.ownerId)
                        .then((user) => isMounted && setOwner(user))
                        .catch(() => isMounted && setOwner(null));
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setError(err.message || "Failed to load listing");
                }
            })
            .finally(() => isMounted && setLoading(false));
        return () => {
            isMounted = false;
        };
    }, [id]);

    // Check if property is saved for current user
    useEffect(() => {
        if (currentUser && id) {
            getSavedProperties(currentUser.id)
                .then((data) => {
                    const savedIds = data.savedProperties || [];
                    setIsSaved(savedIds.some(pid => String(pid) === String(id)));
                })
                .catch(() => setIsSaved(false));
        }
    }, [id, currentUser?.id]);

    const apiBase = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
        : '';
    const images = (property?.images || []).map((img) =>
        img.startsWith('/uploads') ? `${apiBase}${img}` : img
    );
    const ownerAvatar = owner?.avatar
        ? (owner.avatar.startsWith('/uploads') ? `${apiBase}${owner.avatar}` : owner.avatar)
        : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmgRRWWJoxWiRu5d3_NP3vVJNGIuRIlEjsPg&s";

    if (!currentUser) {
      return (
        <div className="singlePage">
          <div className="details">
            <div className="wrapper">
              <h1>Please log in to view property details</h1>
              <p>Sign in or sign up to access full property information and contact owners.</p>
              <div className="authButtons">
                <Link to="/signin" className="authBtn">Sign In</Link>
                <Link to="/signup" className="authBtn">Sign Up</Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const handleSendMessage = async () => {
        if (!currentUser) {
            navigate("/signin");
            return;
        }
        if (!owner?.email) {
            setSendError("Owner email not available");
            return;
        }
        if (!messageText.trim()) {
            setSendError("Please enter a message");
            return;
        }
        setSending(true);
        setSendError("");
        try {
            await createThread({
                senderId: currentUser.id,
                recipientEmail: owner.email,
                text: messageText.trim()
            });
            setSendSuccess(true);
            setMessageText("");
            setTimeout(() => {
                setShowMessageModal(false);
                setSendSuccess(false);
                navigate("/profile");
            }, 1500);
        } catch (err) {
            setSendError(err.message || "Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const openMessageModal = () => {
        if (!currentUser) {
            navigate("/signin");
            return;
        }
        setShowMessageModal(true);
        setSendError("");
        setSendSuccess(false);
    };

    const handleSaveProperty = async () => {
        if (!currentUser) {
            navigate("/signin");
            return;
        }
        setSaving(true);
        setSaveError("");
        try {
            if (isSaved) {
                await unsaveProperty(currentUser.id, id);
                setIsSaved(false);
            } else {
                await saveProperty(currentUser.id, id);
                setIsSaved(true);
            }
        } catch (err) {
            setSaveError(err.message || "Failed to save property");
        } finally {
            setSaving(false);
        }
    };

    const handleVerifyProperty = async (legalStatus) => {
        if (!currentUser) {
            navigate("/signin");
            return;
        }
        setVerifyError("");
        setVerifyMessage("");
        setVerifyLoading(true);
        try {
            const updated = await verifyProperty(id, {
                verified: true,
                legalStatus,
                user: currentUser.fullName || currentUser.email || 'user',
                notes: `User-driven verification: ${legalStatus}`,
            });
            setProperty(updated);
            setVerifyMessage(`Property marked as ${legalStatus}.`);
        } catch (err) {
            setVerifyError(err.message || "Failed to verify property");
        } finally {
            setVerifyLoading(false);
        }
    };

    const openPaymentModal = (type) => {
        if (!currentUser) {
            navigate("/signin");
            return;
        }
        setPaymentType(type);
        setShowPaymentModal(true);
        setPaymentError("");
        setPaymentSuccess(false);
    };

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Format card number with spaces (every 4 digits)
        if (name === "cardNumber") {
            formattedValue = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
        }

        // Format expiry date (MM/YY)
        if (name === "expiryDate") {
            formattedValue = value.replace(/\D/g, "").slice(0, 4);
            if (formattedValue.length >= 2) {
                formattedValue = formattedValue.slice(0, 2) + "/" + formattedValue.slice(2);
            }
        }

        // Limit CVV to 4 digits
        if (name === "cvv") {
            formattedValue = value.replace(/\D/g, "").slice(0, 4);
        }

        setPaymentData({
            ...paymentData,
            [name]: formattedValue,
        });
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setPaymentError("");
        setPaymentLoading(true);

        try {
            const response = await processTransaction({
                userId: currentUser.id,
                propertyId: id,
                type: property.type || paymentType,
                amount: property.price,
                cardNumber: paymentData.cardNumber,
                cardHolder: paymentData.cardHolder,
                expiryDate: paymentData.expiryDate,
                cvv: paymentData.cvv,
            });

            setPaymentSuccess(true);
            setTimeout(() => {
                setShowPaymentModal(false);
                setPaymentSuccess(false);
                setPaymentData({ cardNumber: "", cardHolder: "", expiryDate: "", cvv: "" });
                alert(`Property ${paymentType === "buy" ? "purchased" : "rented"} successfully!`);
                navigate("/profile");
            }, 1500);
        } catch (err) {
            setPaymentError(err.message || "Payment failed. Please try again.");
        } finally {
            setPaymentLoading(false);
        }
    };

    if (loading) {

        return <div className="singlePage"><div className="details"><div className="wrapper">Loading...</div></div></div>;
    }

    if (error || !property) {
        return <div className="singlePage"><div className="details"><div className="wrapper">{error || "Listing not found"}</div></div></div>;
    }

    return (
        <div className="singlePage">
            <div className="details">
                <div className="wrapper">
                    {images.length > 0 && <Slider images={images} />}
                    <div className="info">
                        <div className="top">
                            <div className="post">
                                <h1>{property.title}</h1>
                                <div className="address">
                                    <img src="/pin.png" alt="" />
                                    <span>{getMainLocationName(property.address)}</span>
                                </div>
                                <div className="statusRow">
                                    <span className={`statusBadge ${property.verified ? 'verified' : 'unverified'}`}>
                                        {property.verified ? 'Verified' : 'Not Verified'}
                                    </span>
                                    <span className={`statusBadge ${property.legalStatus === 'illegal' ? 'illegal' : 'legal'}`}>
                                        {property.legalStatus ? property.legalStatus.toUpperCase() : 'UNKNOWN'}
                                    </span>
                                </div>
                                <div className="price">
                                    ₹ {Number(property.price).toLocaleString("en-IN")}
                                    {property.type === 'rent' && <span className="priceLabel">/month</span>}
                                    {property.type && (
                                      <span className={`propertyTypeBadge ${property.type}`}>
                                        {property.type === 'rent' ? '🔑 For Rent' : '🏠 For Sale'}
                                      </span>
                                    )}
                                </div>
                            </div>
                            <div className="user">
                                <img src={ownerAvatar} alt="" />
                                <div className="ownerInfo">
                                    <span>{owner?.fullName || "Owner"}</span>
                                    <small>{owner?.email || ""}</small>
                                    <small>{owner?.userType ? `Type: ${owner.userType}` : ""}</small>
                                </div>
                            </div>
                        </div>
                        <div className="bottom">
                            {property.description || "No description provided."}
                        </div>
                    </div>
                </div>
            </div>
            <div className="features">
                <div className="wrapper">
                    <p className="title">General</p>
                    <div className="listVertical">
                        <div className="feature">
                            <img src="/utility.png" alt="" />
                            <div className="featureText">
                                <span>Utilities</span>
                                <p>Renter is responsible.</p>
                            </div>
                        </div>
                        <div className="feature">
                            <img src="/pet.png" alt="" />
                            <div className="featureText">
                                <span>Pet Policy</span>
                                <p>Pet allowed.</p>
                            </div>
                        </div>
                        <div className="feature">
                            <img src="/fee.png" alt="" />
                            <div className="featureText">
                                <span>Property Fees</span>
                                <p>Must have 3x the rent in total household income.</p>
                            </div>
                        </div>
                    </div>
                    <p className="title">Room Sizes</p>
                    <div className="sizes">
                        <div className="size">
                            <img src="/size.png" alt="" />
                            <span>80 sqft</span>
                        </div>
                        <div className="size">
                            <img src="/bed.png" alt="" />
                            <span>{property.bedroom} beds</span>
                        </div>
                        <div className="size">
                            <img src="/bath.png" alt="" />
                            <span>{property.bathroom} bathroom</span>
                        </div>
                    </div>
                    <p className="title">Nearby Places</p>
                    <div className="listHorizontal">
                        <div className="feature">
                            <img src="/school.png" alt="" />
                            <div className="featureText">
                                <span>School</span>
                                <p>250m away</p>
                            </div>
                        </div>
                        <div className="feature">
                            <img src="/pet.png" alt="" />
                            <div className="featureText">
                                <span>Bus Stop</span>
                                <p>100m away</p>
                            </div>
                        </div>
                        <div className="feature">
                            <img src="/fee.png" alt="" />
                            <div className="featureText">
                                <span>Restaurant</span>
                                <p>200m away</p>
                            </div>
                        </div>
                    </div>
                    <p className="title">Location</p>
                    <div className="mapContainer">
                        <LeafletMap items={[property]} />
                    </div>
                    <div className="buttons">
                        <button onClick={openMessageModal}>
                            <img src="/chat.png" alt="" />
                            Send a Message
                        </button>
                        <button 
                            onClick={handleSaveProperty} 
                            disabled={saving}
                            className={isSaved ? "saved" : ""}
                        >
                            <img src="/save.png" alt="" />
                            {saving ? "Saving..." : isSaved ? "Saved ✓" : "Save the Place"}
                        </button>
                    </div>
                    <div className="purchaseControls">
                        {property.type === 'rent' ? (
                          <button onClick={() => openPaymentModal('rent')} className="rentBtn">
                            <span>🔑</span> Rent Property — ₹{Number(property.price).toLocaleString("en-IN")}/month
                          </button>
                        ) : (
                          <button onClick={() => openPaymentModal('buy')} className="buyBtn">
                            <span>🏠</span> Buy Property — ₹{Number(property.price).toLocaleString("en-IN")}
                          </button>
                        )}
                    </div>
                    <div className="verifyControls">
                        <button onClick={() => handleVerifyProperty('legal')} disabled={verifyLoading} className="verifyBtn legalBtn">
                            {verifyLoading ? 'Processing...' : 'Mark as Legal'}
                        </button>
                        <button onClick={() => handleVerifyProperty('illegal')} disabled={verifyLoading} className="verifyBtn illegalBtn">
                            {verifyLoading ? 'Processing...' : 'Flag Illegal'}
                        </button>
                    </div>
                    {saveError && <p className="saveError">{saveError}</p>}
                    {verifyError && <p className="saveError">{verifyError}</p>}
                    {verifyMessage && <p className="success">{verifyMessage}</p>}

                    {/* Message Modal */}
                    {showMessageModal && (
                        <div className="messageModal">
                            <div className="modalOverlay" onClick={() => setShowMessageModal(false)}></div>
                            <div className="modalContent">
                                <h3>Send Message to {owner?.fullName || "Owner"}</h3>
                                {sendSuccess ? (
                                    <p className="success">Message sent successfully!</p>
                                ) : (
                                    <>
                                        <textarea
                                            placeholder="Type your message here..."
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            rows={4}
                                        />
                                        {sendError && <p className="error">{sendError}</p>}
                                        <div className="modalButtons">
                                            <button onClick={() => setShowMessageModal(false)} className="cancelBtn">
                                                Cancel
                                            </button>
                                            <button onClick={handleSendMessage} disabled={sending} className="sendBtn">
                                                {sending ? "Sending..." : "Send"}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Payment Modal */}
                    {showPaymentModal && (
                        <div className="paymentModal">
                            <div className="modalOverlay" onClick={() => setShowPaymentModal(false)}></div>
                            <div className="modalContent">
                                <h3>{property.type === 'rent' ? '🔑 Rent Property' : '🏠 Purchase Property'}</h3>
                                {paymentSuccess ? (
                                    <p className="success">✓ Transaction successful! Redirecting...</p>
                                ) : (
                                    <form onSubmit={handlePaymentSubmit}>
                                        <div className="amountDisplay">
                                            <span className="label">Amount:</span>
                                            <span className="amount">
                                                ₹{Number(property.price).toLocaleString("en-IN")}
                                                {property.type === 'rent' && '/month'}
                                            </span>
                                        </div>

                                        <div className="formGroup">
                                            <label>Cardholder Name</label>
                                            <input
                                                type="text"
                                                name="cardHolder"
                                                placeholder="John Doe"
                                                value={paymentData.cardHolder}
                                                onChange={handlePaymentChange}
                                                required
                                            />
                                        </div>

                                        <div className="formGroup">
                                            <label>Card Number</label>
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                placeholder="1234 5678 9012 3456"
                                                value={paymentData.cardNumber}
                                                onChange={handlePaymentChange}
                                                maxLength="19"
                                                required
                                            />
                                        </div>

                                        <div className="formRow">
                                            <div className="formGroup">
                                                <label>Expiry Date</label>
                                                <input
                                                    type="text"
                                                    name="expiryDate"
                                                    placeholder="MM/YY"
                                                    value={paymentData.expiryDate}
                                                    onChange={handlePaymentChange}
                                                    required
                                                />
                                            </div>
                                            <div className="formGroup">
                                                <label>CVV</label>
                                                <input
                                                    type="text"
                                                    name="cvv"
                                                    placeholder="123"
                                                    value={paymentData.cvv}
                                                    onChange={handlePaymentChange}
                                                    maxLength="4"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {paymentError && <p className="error">{paymentError}</p>}

                                        <div className="modalButtons">
                                            <button type="button" onClick={() => setShowPaymentModal(false)} className="cancelBtn">
                                                Cancel
                                            </button>
                                            <button type="submit" disabled={paymentLoading} className="payBtn">
                                                {paymentLoading ? "Processing..." : `Pay ₹${Number(property.price).toLocaleString("en-IN")}`}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SinglePage;
