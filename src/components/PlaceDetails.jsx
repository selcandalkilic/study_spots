function PlaceDetails({ place, onClose }) {
  if (!place) {
    return null;
  }

  return (
    <div className="place-details">
      <button onClick={onClose}>← Back to list</button>

      <h2>{place.name}</h2>
      <p>
        {place.category} · {place.city}, {place.country}
      </p>

      <p>{place.description}</p>

      <div className="details-grid">
        <div>
          <strong>WiFi</strong>
          <p>{place.wifi ? "Yes" : "No"}</p>
        </div>

        <div>
          <strong>Quiet</strong>
          <p>{place.quiet ? "Yes" : "No"}</p>
        </div>

        <div>
          <strong>Opening hours</strong>
          <p>{place.opening_hours}</p>
        </div>

        <div>
          <strong>Category</strong>
          <p>{place.category}</p>
        </div>

       <div>
            <strong>Study rating</strong>
            <p>{place.study_rating ? `${place.study_rating}/5` : "Not rated yet"}</p>
        </div>

        <div>
          <strong>WiFi quality</strong>
          <p>{place.wifi_quality}</p>
        </div>

        <div>
          <strong>Power outlets</strong>
          <p>{place.outlets}</p>
        </div>

        <div>
          <strong>Noise level</strong>
          <p>{place.noise_level}</p>
        </div>

        <div>
          <strong>Seating</strong>
          <p>{place.seating}</p>
        </div>

        <div>
          <strong>Laptop friendly</strong>
          <p>{place.laptop_friendly ? "Yes" : "No"}</p>
        </div>

        <div>
          <strong>Solo study</strong>
          <p>{place.solo_study ? "Yes" : "No"}</p>
        </div>

        <div>
          <strong>Group study</strong>
          <p>{place.group_study ? "Yes" : "No"}</p>
        </div>

        <div>
          <strong>Best time to study</strong>
          <p>{place.best_time_to_study}</p>
        </div>

        <div>
          <strong>Crowded times</strong>
          <p>{place.crowded_times}</p>
        </div>
      </div>

      <div className="reviews-section">
        <h3>Reviews</h3>

        {place.reviews && place.reviews.length > 0 ? (
          place.reviews.map((review) => (
            <div className="review-card" key={review.id}>
            <strong>Anonymous user</strong>
            <p>{place.study_rating ? `${place.study_rating}/5` : "Not rated yet"}</p>
            <p>{review.comment}</p>
            <small>{new Date(review.created_at).toLocaleDateString()}</small>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>
    </div>
  );
}

export default PlaceDetails;