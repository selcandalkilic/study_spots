import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ReviewForm from "./ReviewForm";

function PlaceDetails({ place, onClose, session }) {
  const [reviews, setReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
const [editRating, setEditRating] = useState(5);
const [editComment, setEditComment] = useState("");
const [editIsAnonymous, setEditIsAnonymous] = useState(false);

function startEditingReview(review) {
  setEditingReviewId(review.id);
  setEditRating(review.rating);
  setEditComment(review.comment || "");
  setEditIsAnonymous(review.is_anonymous || false);
}

async function updateReview(reviewId) {
  const { error } = await supabase
    .from("reviews")
    .update({
      rating: Number(editRating),
      comment: editComment,
      is_anonymous: editIsAnonymous,
    })
    .eq("id", reviewId);

  if (error) {
    alert(error.message);
  } else {
    setEditingReviewId(null);
    fetchReviews();
  }
}

async function deleteReview(reviewId) {
  const confirmDelete = window.confirm("Delete this review?");

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) {
    alert(error.message);
  } else {
    fetchReviews();
  }
}

async function fetchReviews() {
  if (!place) return;

  const { data: reviewsData, error: reviewsError } = await supabase
    .from("reviews")
    .select("*")
    .eq("place_id", place.id)
    .order("created_at", { ascending: false });

  if (reviewsError) {
    console.log("Review fetch error:", reviewsError);
    return;
  }

  const userIds = reviewsData
    .map((review) => review.user_id)
    .filter(Boolean);

  if (userIds.length === 0) {
    setReviews(reviewsData || []);
    return;
  }

  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, full_name")
    .in("id", userIds);

  if (profilesError) {
    console.log("Profile fetch error:", profilesError);
    setReviews(reviewsData || []);
    return;
  }

  const reviewsWithProfiles = (reviewsData || []).map((review) => {
    const profile = (profilesData || []).find(
      (profile) => profile.id === review.user_id
    );

    return {
      ...review,
      profile,
    };
  });

  setReviews(reviewsWithProfiles);
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
          reviews.map((review) => {
  const isOwnReview = session && session.user.id === review.user_id;

  const displayName = review.is_anonymous
    ? "Anonymous user"
    : review.profile?.username || "Study Spots user";

  return (
    <div key={review.id} className="review-card">
      {editingReviewId === review.id ? (
        <>
          <select
            value={editRating}
            onChange={(e) => setEditRating(e.target.value)}
          >
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>

          <textarea
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
          />

          <label className="anonymous-checkbox">
            <input
              type="checkbox"
              checked={editIsAnonymous}
              onChange={(e) => setEditIsAnonymous(e.target.checked)}
            />
            Hide my username
          </label>

          <button onClick={() => updateReview(review.id)}>Save</button>
          <button onClick={() => setEditingReviewId(null)}>Cancel</button>
        </>
      ) : (
        <>
          <strong>{displayName}</strong>
          <p>
            {"★".repeat(review.rating)}
            {"☆".repeat(5 - (review.rating || 0))} {review.rating || "No rating"}/5
          </p>
          <p>{review.comment}</p>
          <small>{new Date(review.created_at).toLocaleDateString()}</small>

          {isOwnReview && (
            <div className="review-actions">
              <button onClick={() => startEditingReview(review)}>Edit</button>
              <button onClick={() => deleteReview(review.id)}>Delete</button>
            </div>
          )}
        </>
      )}
    </div>
  );
})
        )}
      </div>
    </div>
  );
}

export default PlaceDetails;