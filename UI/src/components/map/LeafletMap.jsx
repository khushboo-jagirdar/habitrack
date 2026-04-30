import "./map.scss";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";

function createPinIcon(price) {
  const label = price >= 10000000
    ? `₹${(price / 10000000).toFixed(1)}Cr`
    : price >= 100000
    ? `₹${(price / 100000).toFixed(0)}L`
    : `₹${price}`;
  return L.divIcon({
    className: "",
    html: `<div class="customPin"><span>${label}</span></div>`,
    iconSize: [80, 36],
    iconAnchor: [40, 36],
    popupAnchor: [0, -38],
  });
}

function FlyController({ items }) {
  const map = useMap();
  const prevKey = useRef(null);

  useEffect(() => {
    const valid = (items || []).filter(
      (i) => Number.isFinite(Number(i.latitude)) && Number.isFinite(Number(i.longitude)) &&
             (Number(i.latitude) !== 0 || Number(i.longitude) !== 0)
    );
    if (!valid.length) return;

    const key = valid.map((i) => `${i.latitude},${i.longitude}`).join("|");
    if (key === prevKey.current) return;
    prevKey.current = key;

    if (valid.length === 1) {
      map.flyTo([Number(valid[0].latitude), Number(valid[0].longitude)], 14, {
        animate: true, duration: 1.4,
      });
    } else {
      const bounds = L.latLngBounds(valid.map((i) => [Number(i.latitude), Number(i.longitude)]));
      map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 13, animate: true, duration: 1.4 });
    }
  }, [items, map]);

  return null;
}

function Pin({ item }) {
  const lat = Number(item.latitude);
  const lng = Number(item.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return null;

  const apiBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, "") : "";
  const rawImage = item?.images?.[0];
  const imageUrl = rawImage
    ? (rawImage.startsWith("/uploads") ? `${apiBase}${rawImage}` : rawImage)
    : null;

  return (
    <Marker position={[lat, lng]} icon={createPinIcon(item.price)}>
      <Popup className="customPopup">
        <div className="popupContainer">
          {imageUrl && <img src={imageUrl} alt={item.title} />}
          <div className="textContainer">
            <Link to={`/${item._id || item.id}`}>{item.title}</Link>
            <span>{(item.address || "").split(",").slice(-2).join(",").trim()}</span>
            <div className="popupMeta">
              {item.bedroom > 0 && <span>{item.bedroom} bed</span>}
              <b>₹{Number(item.price).toLocaleString("en-IN")}</b>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

function LeafletMap({ items = [] }) {
  return (
    <MapContainer
      center={[27.5, 77.8]}
      zoom={7}
      scrollWheelZoom={true}
      className="map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <FlyController items={items} />
      {(items || []).map((item) => (
        <Pin item={item} key={item._id || item.id} />
      ))}
    </MapContainer>
  );
}

export default LeafletMap;

