import { Link } from "react-router-dom";

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }

  return `${distanceKm.toFixed(1)} km away`;
}

function NearbyPlaces({ currentPlace, places }) {
  if (!currentPlace || !places?.length) {
    return null;
  }

  if (!currentPlace.latitude || !currentPlace.longitude) {
    return null;
  }

  const nearbyPlaces = places
    .filter((place) => place.id !== currentPlace.id)
    .filter((place) => place.latitude && place.longitude)
    .map((place) => ({
      ...place,
      distanceKm: getDistanceKm(
        currentPlace.latitude,
        currentPlace.longitude,
        place.latitude,
        place.longitude
      ),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 4);

  if (nearbyPlaces.length === 0) {
    return null;
  }

  return (
    <section className="nearby-places-section">
      <div className="nearby-places-header">
        <h2>Nearby Places</h2>
        <p>Other study spots close to this location.</p>
      </div>

      <div className="nearby-places-list">
        {nearbyPlaces.map((place) => {
          const rating =
            place.average_rating ||
            place.avg_rating ||
            place.rating ||
            null;

          const tags = [
            place.has_wifi && "WiFi",
            place.has_outlets && "Outlets",
            place.long_study_friendly && "Long study",
            place.laptop_friendly && "Laptop friendly",
            place.quiet_level && `Quiet: ${place.quiet_level}`,
          ].filter(Boolean);

          return (
            <article key={place.id} className="nearby-place-card">
              <h3>{place.name}</h3>

              <p className="nearby-place-meta">
                {formatDistance(place.distanceKm)}
                {place.category && ` · ${place.category}`}
              </p>

              <p className="nearby-place-rating">
                {rating ? `★ ${Number(rating).toFixed(1)}` : "No rating yet"}
              </p>

              {tags.length > 0 && (
                <div className="nearby-place-tags">
                  {tags.slice(0, 4).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              )}

              <Link to={`/places/${place.slug}`} className="nearby-place-button">
                View place
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default NearbyPlaces;