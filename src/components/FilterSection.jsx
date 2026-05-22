import { useState } from "react";

function FilterSection({
  searchText,
  setSearchText,
  selectedCity,
  setSelectedCity,
  selectedFeatures,
  setSelectedFeatures,
  selectedRating,
  setSelectedRating,
}) {
  const [ratingOpen, setRatingOpen] = useState(false);

  const features = [
    { label: "Quiet", icon: "🤫" },
    { label: "Wi-Fi", icon: "⌁" },
    { label: "Outlets", icon: "🔌" },
    { label: "Laptop Friendly", icon: "💻" },
    { label: "Long Study Friendly", icon: "⏱" },
  ];

  const cities = ["All", "Linz", "Istanbul", "Vienna"];

  function toggleFeature(feature) {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((item) => item !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  }

  return (
    <section className="filter-section">
      <div className="filter-card">
        <div className="filter-search-row">
          <div className="search-input-wrapper">
            <span className="search-icon">⌕</span>

            <input
              type="text"
              placeholder="Search study spots..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <select
            className="city-select"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="chip-scroll">
          {features.map((feature) => (
            <button
              key={feature.label}
              className={
                selectedFeatures.includes(feature.label)
                  ? "filter-chip active"
                  : "filter-chip"
              }
              onClick={() => toggleFeature(feature.label)}
            >
              <span className="chip-icon">{feature.icon}</span>
              {feature.label}
            </button>
          ))}

          <div className="rating-filter-wrapper">
            <button
              className={selectedRating ? "filter-chip active" : "filter-chip"}
              onClick={() => setRatingOpen(!ratingOpen)}
            >
              {selectedRating ? `${selectedRating}+ ★` : "Rating ★"}
            </button>

            {ratingOpen && (
              <div className="rating-popover">
                <p>Minimum rating</p>

                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    className={
                      selectedRating === rating
                        ? "rating-option active"
                        : "rating-option"
                    }
                    onClick={() => {
                      setSelectedRating(rating);
                      setRatingOpen(false);
                    }}
                  >
                    {rating}+ ★
                  </button>
                ))}

                <button
                  className="clear-rating"
                  onClick={() => {
                    setSelectedRating(null);
                    setRatingOpen(false);
                  }}
                >
                  Clear rating
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FilterSection;