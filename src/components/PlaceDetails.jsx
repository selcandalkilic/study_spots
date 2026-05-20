import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";


function PlaceDetails({ place, onClose }) {
  if (!place) {
    return null;
  }
  const [reviews, setReviews] = useState([]);

useEffect(() => {
  async function fetchReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("place_id", place.id);

    if (error) {
      console.error("Error fetching reviews:", error);
    } else {
      setReviews(data);
    }
  }

  if (place) {
    fetchReviews();
  }
}, [place]);

  return (
    <div className="place-details">
      <button onClick={onClose}>← Back to list</button>
      {place.images && place.images.length > 0 ? (
        <img
        className="place-hero-image"
        src={place.images[0]}
        alt={place.name}
        />
      ) : (
        <div className="place-image-placeholder">
          No image added yet
        </div>
      )}
      <div className="place-detail-header">
        <div>
          <h2>{place.name}</h2>
          <p className="place-detail-location">
            {place.category} · {place.city}, {place.country}
          </p>
        </div>
        <div className="place-detail-rating">
          ⭐ {place.study_rating ? `${place.study_rating}/5` : "Not rated yet"}
        </div>
      </div>
      <p className="place-detail-description">{place.description}</p>

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

        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div className="review-card" key={review.id}>
            <strong>Anonymous user</strong>
            <p>{review.rating}/5</p>
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