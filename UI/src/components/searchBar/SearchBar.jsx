import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './searchBar.scss';

const types = ["buy", "rent"];

function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState({
    type: "buy",
    location: "",
    minPrice: "",
    maxPrice: ""
  });

  const switchType = (val) => {
    setQuery(prev => ({ ...prev, type: val }));
  };

  return (
    <div className="searchBar">
      <div className="type">
        {types.map(type => (
          <button 
            key={type}
            onClick={() => switchType(type)}
            className={query.type === type ? "active" : ""}
          >
            {type}
          </button>
        ))}
      </div>

      {/* ✅ form outside type */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const params = new URLSearchParams();
          params.set('type', query.type);
          if (query.location) params.set('location', query.location);
          if (query.minPrice) params.set('minPrice', query.minPrice);
          if (query.maxPrice) params.set('maxPrice', query.maxPrice);
          navigate(`/list?${params.toString()}`);
        }}
      >
        <input
          type="text"
          placeholder="City Location"
          value={query.location}
          onChange={(e) => setQuery((prev) => ({ ...prev, location: e.target.value }))}
        />
        <input
          type="number"
          placeholder="Min Price"
          value={query.minPrice}
          onChange={(e) => setQuery((prev) => ({ ...prev, minPrice: e.target.value }))}
          min="0"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={query.maxPrice}
          onChange={(e) => setQuery((prev) => ({ ...prev, maxPrice: e.target.value }))}
          min="0"
        />

        <button type="submit">
          <img src="/search.png" alt="search" />
        </button>
      </form>
    </div>
  );
}

export default SearchBar;

