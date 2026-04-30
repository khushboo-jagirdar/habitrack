import Card from "../../components/card/Card.jsx";
import "./listPage.scss";
import Filter from "../../components/filter/Filter.jsx";
import LeafletMap from "../../components/map/LeafletMap.jsx";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "/api";

function ListPage() {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const prevSearch = useRef("");
  const { user } = useAuth();

  useEffect(() => {
    const currentSearch = searchParams.toString();
    const isNewSearch = currentSearch !== prevSearch.current && prevSearch.current !== "";
    prevSearch.current = currentSearch;

    setLoading(true);
    if (isNewSearch) {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 3200);
    }

    const params = new URLSearchParams();
    const location = searchParams.get("location");
    const type = searchParams.get("type");
    const propertyType = searchParams.get("propertyType");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bedroom = searchParams.get("bedroom");

    if (location) params.set("location", location);
    if (type && type !== "any") params.set("type", type);
    if (propertyType && propertyType !== "any") params.set("propertyType", propertyType);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedroom) params.set("bedroom", bedroom);

    fetch(`${API_URL}/properties?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setProperties(Array.isArray(data) ? data : []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [searchParams.toString()]);

  if (!user) {
    return (
      <div className="listPage">
        <div className="listContainer">
          <div className="wrapper">
            <div className="loginPrompt">
              <h2>Login required</h2>
              <p>Please sign in or sign up to view listings.</p>
              <div className="authButtons">
                <Link to="/signin" className="authBtn">Sign In</Link>
                <Link to="/signup" className="authBtn">Sign Up</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const location = searchParams.get("location");

  return (
    <div className="listPage">
      <div className="listContainer">
        <div className="wrapper">
          <Filter />

          {loading ? (
            <div className="loadingGrid">
              {[1,2,3].map(i => <div key={i} className="skeletonCard" />)}
            </div>
          ) : properties.length === 0 ? (
            <div className="emptyState">
              <div className="emptyIcon">🏘️</div>
              <h3>No properties found</h3>
              <p>Try adjusting your filters or searching a different location.</p>
            </div>
          ) : (
            <>
              <p className="resultsCount">{properties.length} propert{properties.length === 1 ? "y" : "ies"} found</p>
              {properties.map((item) => (
                <Card key={item._id} item={{ ...item, id: item._id }} />
              ))}
            </>
          )}
        </div>
      </div>

      <div className="mapContainer">
        <div className="mapHeader">
          <div className="mapHeaderLeft">
            <span className="mapHeaderIcon">🗺️</span>
            <div>
              <span className="mapHeaderTitle">Map View</span>
              <span className="mapHeaderSub">
                {properties.length > 0
                  ? `${properties.length} propert${properties.length === 1 ? "y" : "ies"} on map`
                  : "No results to show"}
              </span>
            </div>
          </div>
          {location && (
            <span className="mapHeaderLocation">📍 {location}</span>
          )}
        </div>
        <div className="mapWrapper">
          {showHint && location && (
            <div className="mapSearchHint">
              📍 Pinning results for "{location}"
            </div>
          )}
          <LeafletMap items={properties.map((p) => ({ ...p, id: p._id }))} />
        </div>
      </div>
    </div>
  );
}

export default ListPage;

