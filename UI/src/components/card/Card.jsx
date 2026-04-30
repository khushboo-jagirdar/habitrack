import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSavedProperties, saveProperty, unsaveProperty } from "../../lib/userApi";
import { getMainLocationName } from "../../lib/locationFormatter";
import "./card.scss";

function Card({ item }) {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!currentUser?.id) return;
    getSavedProperties(currentUser.id)
      .then((data) => {
        const savedIds = Array.isArray(data.savedProperties) ? data.savedProperties : [];
        setIsSaved(savedIds.some((savedId) => String(savedId) === String(item.id)));
      })
      .catch(() => {
        setIsSaved(false);
      });
  }, [currentUser, item.id]);

  const handleToggleSave = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!currentUser?.id) {
      return navigate("/signin");
    }

    setSaving(true);
    try {
      if (isSaved) {
        await unsaveProperty(currentUser.id, item.id);
        setIsSaved(false);
      } else {
        await saveProperty(currentUser.id, item.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Save/Unsave failed", err);
      alert(err.message || "Failed to update saved status.");
    } finally {
      setSaving(false);
    }
  };

  const handleChatClick = (e) => {
    e.stopPropagation();
    if (!currentUser?.id) {
      return navigate("/signin");
    }
    navigate(`/${item.id}`);
  };

  const rawImage = item?.images?.[0];
  const apiBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, "")
    : "";
  const imageUrl = rawImage && rawImage.startsWith("/uploads")
    ? `${apiBase}${rawImage}`
    : rawImage;

  return (
    <div className="card" onClick={() => navigate(`/${item.id}`)} style={{ cursor: "pointer" }}>
      <div className="imageContainer">
        <img src={imageUrl} alt={item.title} />
      </div>
      <div className="textContainer">
        <h2 className="title">{item.title}</h2>
        <p className="address">
          <img src="/pin.png" alt="" />
          <span>{getMainLocationName(item.address)}</span>
        </p>
        <div className="verification">
          <span className={`badge ${item.verified ? 'verified' : 'unverified'}`}>
            {item.verified ? 'Verified' : 'Not Verified'}
          </span>
          <span className={`badge ${item.legalStatus === 'illegal' ? 'illegal' : 'legal'}`}>
            {item.legalStatus ? item.legalStatus.toUpperCase() : 'UNKNOWN'}
          </span>
          {item.type && (
            <span className={`badge typeBadge ${item.type}`}>
              {item.type === 'rent' ? '🔑 For Rent' : '🏠 For Sale'}
            </span>
          )}
        </div>
        <p className="price">
          ₹{Number(item.price).toLocaleString("en-IN")}
          {item.type === 'rent' && <span className="perMonth">/month</span>}
        </p>
        <div className="bottom">
          <div className="features">
            <div className="feature">
              <img src="/bed.png" alt="" />
              <span>{item.bedroom} bedroom</span>
            </div>
            <div className="feature">
              <img src="/bath.png" alt="" />
              <span>{item.bathroom} bathroom</span>
            </div>
          </div>
          <div className="icons">
            <button
              type="button"
              className={`iconButton ${isSaved ? 'saved' : ''}`}
              disabled={saving}
              onClick={handleToggleSave}
            >
              <img src="/save.png" alt="save" />
              <span>{saving ? '...' : isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button type="button" className="iconButton" onClick={handleChatClick}>
              <img src="/chat.png" alt="chat" />
              <span>Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
