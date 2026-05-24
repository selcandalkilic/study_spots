import { Link } from "react-router-dom";

function PlaceList({ places }) {
  return (
    <section className="places-section">
      <div className="places-section-header">
        <h2>Study Places</h2>
        <p>{places.length} places found</p>
      </div>

      <div className="places-grid">
        {places.map((place) => (
          <Link
            to={`/places/${place.slug}`}
            className="place-card-link"
            key={place.id}
          >
            <article className="place-card">
              {place.image_url ? (
                <img
                  className="place-card-image"
                  src={place.image_url}
                  alt={place.name}
                />
              ) : (
                <div className="place-card-image-placeholder">
                  No image yet
                </div>
              )}

              <div className="place-card-content">
                <div className="place-card-top">
                  <div>
                    <h3>{place.name}</h3>
                    <p>{place.city}, {place.country}</p>
                  </div>

                  <span className="place-score">
                    {place.study_rating ? place.study_rating : "—"}
                  </span>
                </div>

                <p className="place-card-description">
                  {place.description}
                </p>

                <div className="place-card-stars">
                  ⭐ {place.study_rating ? `${place.study_rating}/5` : "Not rated yet"}
                </div>

                <div className="place-tags">
                  {place.wifi && <span>WiFi</span>}
                  {place.outlets && <span>Outlets</span>}
                  {place.quiet && <span>Quiet</span>}
                  {place.laptop_friendly && <span>Laptop friendly</span>}
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default PlaceList;