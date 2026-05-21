import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ReviewForm from "./ReviewForm";

function PlaceDetails({ place, onClose, session }) {
  const [reviews, setReviews] = useState([]);

  async function fetchReviews() {
    if (!place) return;

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("place_id", place.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Review fetch error:", error);
    } else {
      setReviews(data);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, [place]);

  if (!place) {
    return null;
  }

  return (
    <div className="place-details">
      <button onClick={() => window.history.back()}>← Back to places</button>

      {place.image_url ? (
        <img
          className="place-hero-image"
          src={place.image_url}
          alt={place.name}
        />
      ) : (
        <div className="place-image-placeholder">No image added yet</div>
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
        <ReviewForm
          placeId={place.id}
          session={session}
          onReviewAdded={fetchReviews}
        />

        <h3>Reviews</h3>

        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <strong>Anonymous user</strong>
             <p>
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)} {review.rating}/5
            </p>
              <p>{review.comment}</p>
              <small>{new Date(review.created_at).toLocaleDateString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PlaceDetails;