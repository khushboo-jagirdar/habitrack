import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./Filter.scss";

function Filter() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    location: searchParams.get("location") || "",
    type: searchParams.get("type") || "any",
    propertyType: searchParams.get("propertyType") || "any",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bedroom: searchParams.get("bedroom") || "",
  });

  useEffect(() => {
    setFilters({
      location: searchParams.get("location") || "",
      type: searchParams.get("type") || "any",
      propertyType: searchParams.get("propertyType") || "any",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      bedroom: searchParams.get("bedroom") || "",
    });
  }, [searchParams.toString()]);

  const handleChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.location) params.set("location", filters.location);
    if (filters.type && filters.type !== "any") params.set("type", filters.type);
    if (filters.propertyType && filters.propertyType !== "any") params.set("propertyType", filters.propertyType);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.bedroom) params.set("bedroom", filters.bedroom);
    navigate(`/list?${params.toString()}`);
  };

  // Build a clean heading
  const locationLabel = filters.location || "All Locations";
  const typeLabel = filters.type !== "any" ? filters.type : null;

  return (
    <div className="filter">
      <div className="filterHeading">
        <div className="filterTitle">
          <span className="filterIcon">🔍</span>
          <div>
            <h1>
              {locationLabel}
              {typeLabel && <span className={`typeChip ${typeLabel}`}>{typeLabel === "buy" ? "For Sale" : "For Rent"}</span>}
            </h1>
            <p className="filterSub">
              {filters.propertyType !== "any" ? filters.propertyType + " · " : ""}
              {filters.minPrice || filters.maxPrice
                ? `₹${filters.minPrice || "0"} – ₹${filters.maxPrice || "∞"}`
                : "Any price"}
              {filters.bedroom ? ` · ${filters.bedroom}+ beds` : ""}
            </p>
          </div>
        </div>
      </div>

      <form className="filterForm" onSubmit={handleSubmit}>
        <div className="filterRow">
          <div className="filterField wide">
            <label htmlFor="location">
              <span>📍</span> Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="City, area or address"
              value={filters.location}
              onChange={handleChange}
            />
          </div>

          <div className="filterField">
            <label htmlFor="type">
              <span>🏷️</span> Type
            </label>
            <select name="type" id="type" value={filters.type} onChange={handleChange}>
              <option value="any">Any</option>
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
            </select>
          </div>

          <div className="filterField">
            <label htmlFor="propertyType">
              <span>🏠</span> Property
            </label>
            <select name="propertyType" id="propertyType" value={filters.propertyType} onChange={handleChange}>
              <option value="any">Any</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="land">Land</option>
            </select>
          </div>

          <div className="filterField">
            <label htmlFor="minPrice">
              <span>₹</span> Min Price
            </label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              placeholder="Any"
              value={filters.minPrice}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="filterField">
            <label htmlFor="maxPrice">
              <span>₹</span> Max Price
            </label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              placeholder="Any"
              value={filters.maxPrice}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="filterField">
            <label htmlFor="bedroom">
              <span>🛏</span> Min Beds
            </label>
            <input
              type="number"
              id="bedroom"
              name="bedroom"
              placeholder="Any"
              value={filters.bedroom}
              onChange={handleChange}
              min="0"
            />
          </div>

          <button type="submit" className="filterBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Search
          </button>
        </div>
      </form>
    </div>
  );
}

export default Filter;

