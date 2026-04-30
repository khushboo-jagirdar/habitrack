import "./pin.scss";
import { Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";

function createPinIcon(price) {
  const label =
    price >= 10000000
      ? `₹${(price / 10000000).toFixed(1)}Cr`
      : price >= 100000
      ? `₹${(price / 100000).toFixed(0)}L`
      : `₹${Number(price).toLocaleString("en-IN")}`;

  return L.divIcon({
    className: "",
    html: `<div class="customPin"><span>${label}</span></div>`,
    iconSize: [60, 28],
    iconAnchor: [30, 36],
    popupAnchor: [0, -38],
  });
}

function Pin({ item }) {
  const lat = Number(item.latitude);
  const lng = Number(item.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return null;

  const apiBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, "")
    : "";
  const rawImage = item?.images?.[0];
  const imageUrl = rawImage
    ? rawImage.startsWith("/uploads") ? `${apiBase}${rawImage}` : rawImage
    : "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400";

  const city = (item.address || "").split(",").slice(-2).join(",").trim();

  return (
    <Marker position={[lat, lng]} icon={createPinIcon(item.price)}>
      <Popup className="customPopup" maxWidth={260}>
        <div className="popupContainer">
          <img className="popupImage" src={imageUrl} alt={item.title} />
          <div className="popupBody">
            <Link className="popupTitle" to={`/${item._id || item.id}`}>
              {item.title}
            </Link>
            <div className="popupAddress">📍 {city}</div>
            <div className="popupFooter">
              <span className="popupPrice">
                ₹{Number(item.price).toLocaleString("en-IN")}
              </span>
              <div className="popupTags">
                {item.type && (
                  <span className={`popupTag ${item.type}`}>{item.type}</span>
                )}
                {item.bedroom > 0 && (
                  <span className="popupTag bed">{item.bedroom} bed</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default Pin;

