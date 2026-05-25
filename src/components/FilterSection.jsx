import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function FilterSection({
  searchText,
  setSearchText,

  cityOptions,
  selectedCity,
  setSelectedCity,

  categoryOptions,
  selectedCategory,
  setSelectedCategory,

  sortOption,
  setSortOption,

  selectedFeatures,
  setSelectedFeatures,
  selectedRating,
  setSelectedRating,
}) {
  const [ratingOpen, setRatingOpen] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [citySearchText, setCitySearchText] = useState("");
  const [cityResults, setCityResults] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const features = [
  { label: "Quiet", icon: "🤫" },
  { label: "Wi-Fi", icon: "🛜" },
  { label: "Outlets", icon: "🔌" },
  { label: "Laptop Friendly", icon: "💻" },
  { label: "Long Study Friendly", icon: "⏱" }];

  const mainMobileFeatures = features.filter((feature) => ["Quiet", "Wi-Fi", "Outlets"].includes(feature.label));
  const extraMobileFeatures = features.filter((feature) => ["Laptop Friendly", "Long Study Friendly"].includes(feature.label));

  useEffect(() => {
    async function searchCities() {
      const search = citySearchText.trim();

      if (search.length < 2) {
        setCityResults([]);
        return;
      }

      setCityLoading(true);

      const { data, error } = await supabase
        .from("world_cities")
        .select("city, country, iso2, population")
        .ilike("city", `${search}%`)
        .order("population", { ascending: false })
        .limit(20);

      if (error) {
        console.log("City search error:", error);
        setCityResults([]);
      } else {
        setCityResults(data || []);
      }

      setCityLoading(false);
    }

    searchCities();
  }, [citySearchText]);

  function toggleFeature(feature) {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((item) => item !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  }
  const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "rating-high", label: "Highest rated" },
  { value: "most-reviewed", label: "Most reviewed" },
  { value: "newest", label: "Newest" },
  { value: "closest", label: "Closest" },
];

const selectedSortLabel =
  sortOptions.find((option) => option.value === sortOption)?.label ||
  "Recommended";

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

          <div className="city-search-wrapper">
            <button
              type="button"
              className="city-search-button"
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
            >
              {selectedCity === "All" ? "All cities" : selectedCity}
              <span>⌄</span>
            </button>

            {cityDropdownOpen && (
              <div className="city-search-menu">
                <input
                  type="text"
                  placeholder="Type city..."
                  value={citySearchText}
                  onChange={(e) => setCitySearchText(e.target.value)}
                />

                <div className="city-search-options">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCity("All");
                      setCityDropdownOpen(false);
                      setCitySearchText("");
                      setCityResults([]);
                    }}
                  >
                    All cities
                  </button>

                  {citySearchText.trim().length < 2 ? (
                    <p>Type at least 2 letters</p>
                  ) : cityLoading ? (
                    <p>Loading cities...</p>
                  ) : cityResults.length === 0 ? (
                    <p>No cities found</p>
                  ) : (
                    cityResults.map((item) => (
                      <button
                        type="button"
                        key={`${item.city}-${item.iso2}-${item.population}`}
                        onClick={() => {
                          setSelectedCity(item.city);
                          setCityDropdownOpen(false);
                          setCitySearchText("");
                          setCityResults([]);
                        }}
                      >
                        {item.city}
                        {item.country ? `, ${item.country}` : ""}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

         <select
          className="filter-select"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="recommended">Recommended</option>
          <option value="rating-high">Highest rated</option>
          <option value="most-reviewed">Most reviewed</option>
          <option value="newest">Newest</option>
          <option value="closest">Closest</option>
        </select>

          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {(categoryOptions || ["All"]).map((category) => (
              <option key={category} value={category}>
                {category === "All" ? "All categories" : category}
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