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
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const features = [
  { label: "Quiet", icon: "🤫" },
  { label: "Wi-Fi", icon: "🛜" },
  { label: "Outlets", icon: "🔌" },
  { label: "Laptop Friendly", icon: "💻" },
  { label: "Long Study Friendly", icon: "⏱" }];

  const mainMobileFeatures = features.filter((feature) => ["Quiet", "Wi-Fi", "Outlets"].includes(feature.label));
  const extraMobileFeatures = features.filter((feature) => ["Laptop Friendly", "Long Study Friendly"].includes(feature.label));

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

        <div className="filter-chip-row desktop-filter-row">
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
  </div>

  <div className="rating-filter-wrapper">
    <button
      className={selectedRating ? "filter-chip active" : "filter-chip"}
      onClick={() => setRatingOpen(!ratingOpen)}
    >
      {selectedRating ? `${selectedRating} ★` : "Rating ★"}
    </button>

    {ratingOpen && (
      <div className="rating-popover">
        <p>Minimum rating</p>

        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            type="button"
            key={rating}
            className={
              selectedRating === rating
                ? "rating-option active"
                : "rating-option"
            }
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedRating(rating);
              setRatingOpen(false);
            }}
          >
            {rating} ★
          </button>
        ))}

        <button
          type="button"
          className="clear-rating"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
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

<div className="mobile-filter-area">
  <div className="mobile-main-filters">
    {mainMobileFeatures.map((feature) => (
      <button
        key={feature.label}
        className={
          selectedFeatures.includes(feature.label)
            ? "filter-chip mobile-chip active"
            : "filter-chip mobile-chip"
        }
        onClick={() => toggleFeature(feature.label)}
      >
        <span className="chip-icon">{feature.icon}</span>
        {feature.label}
      </button>
    ))}

    <button
      type="button"
      className={
        moreFiltersOpen
          ? "filter-chip mobile-chip active"
          : "filter-chip mobile-chip"
      }
      onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
    >
      ⋯ More
    </button>
  </div>

  {moreFiltersOpen && (
    <div className="mobile-extra-filters">
      {extraMobileFeatures.map((feature) => (
        <button
          key={feature.label}
          className={
            selectedFeatures.includes(feature.label)
              ? "filter-chip mobile-chip active"
              : "filter-chip mobile-chip"
          }
          onClick={() => toggleFeature(feature.label)}
        >
          <span className="chip-icon">{feature.icon}</span>
          {feature.label === "Laptop Friendly"
            ? "Laptop"
            : feature.label === "Long Study Friendly"
            ? "Long Study"
            : feature.label}
        </button>
      ))}

      <div className="rating-filter-wrapper mobile-rating-wrapper">
        <button
          className={
            selectedRating
              ? "filter-chip mobile-chip active"
              : "filter-chip mobile-chip"
          }
          onClick={() => setRatingOpen(!ratingOpen)}
        >
          {selectedRating ? `${selectedRating} ★` : "Rating ★"}
        </button>

        {ratingOpen && (
          <div className="rating-popover">
            <p>Minimum rating</p>

            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                type="button"
                key={rating}
                className={
                  selectedRating === rating
                    ? "rating-option active"
                    : "rating-option"
                }
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedRating(rating);
                  setRatingOpen(false);
                }}
              >
                {rating} ★
              </button>
            ))}

            <button
              type="button"
              className="clear-rating"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
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
  )}
</div>
      </div>
    </section>
  );
}

export default FilterSection;