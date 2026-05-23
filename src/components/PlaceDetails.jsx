import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ReviewForm from "./ReviewForm";
import "../place-details.css";
import { Link } from "react-router-dom";
import "../reviews.css";

function PlaceDetails({ place, onClose, session }) {
const [reviews, setReviews] = useState([]);
const [editingReviewId, setEditingReviewId] = useState(null);
const [editRating, setEditRating] = useState(5);
const [editComment, setEditComment] = useState("");
const [editIsAnonymous, setEditIsAnonymous] = useState(false);
const averageStudyRating = getAverage("rating");
const averageWifiRating = getAverage("wifi_rating");
const averageOutletsRating = getAverage("outlets_rating");
const averageNoiseRating = getAverage("noise_rating");
const averageSeatingRating = getAverage("seating_rating");
const averageCrowdednessRating = getAverage("crowdedness_rating");
const averagePriceRating = getAverage("price_rating");
const [editWifiRating, setEditWifiRating] = useState(null);
const [editOutletsRating, setEditOutletsRating] = useState(null);
const [editNoiseRating, setEditNoiseRating] = useState(null);
const [editSeatingRating, setEditSeatingRating] = useState(null);
const [editCrowdednessRating, setEditCrowdednessRating] = useState(null);
const [editPriceRating, setEditPriceRating] = useState(null);
const [editLaptopFriendly, setEditLaptopFriendly] = useState(null);
const [editSeatingType, setEditSeatingType] = useState("");

function getYesPercentage(fieldName) {
  const values = reviews
    .map((review) => review[fieldName])
    .filter((value) => value !== null && value !== undefined);

  if (values.length === 0) return null;

  const yesCount = values.filter(Boolean).length;
  return Math.round((yesCount / values.length) * 100);
}

function getMostCommon(fieldName) {
  const values = reviews
    .map((review) => review[fieldName])
    .filter(Boolean);

  if (values.length === 0) return null;

  const counts = {};

  values.forEach((value) => {
    counts[value] = (counts[value] || 0) + 1;
  });

  return Object.keys(counts).reduce((a, b) =>
    counts[a] > counts[b] ? a : b
  );
}

const laptopFriendlyPercentage = getYesPercentage("laptop_friendly");
const groupStudyPercentage = getYesPercentage("group_study_friendly");
const mostCommonBestTime = getMostCommon("best_time_to_study");

function startEditingReview(review) {
  setEditingReviewId(review.id);
  setEditRating(review.rating);
  setEditComment(review.comment || "");
  setEditIsAnonymous(review.is_anonymous);

  setEditWifiRating(review.wifi_rating);
  setEditOutletsRating(review.outlets_rating);
  setEditNoiseRating(review.noise_rating);
  setEditSeatingRating(review.seating_rating);
  setEditCrowdednessRating(review.crowdedness_rating);
  setEditPriceRating(review.price_rating);
  setEditLaptopFriendly(review.laptop_friendly);
  setEditSeatingType(review.seating_type || "");

}

async function updateReview(reviewId) {
  const { error } = await supabase
    .from("reviews")
    .update({
      rating: Number(editRating),
      comment: editComment,
      is_anonymous: editIsAnonymous,
      wifi_rating: editWifiRating || null,
    outlets_rating: editOutletsRating || null,
    noise_rating: editNoiseRating || null,
    seating_rating: editSeatingRating || null,
    crowdedness_rating: editCrowdednessRating || null,
    price_rating: editPriceRating || null,
    laptop_friendly: editLaptopFriendly,
    seating_type: editSeatingType || null,
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
useEffect(() => {
  if (place?.id) {
    fetchReviews();
  }
}, [place?.id]);

function getAverage(fieldName) {
  const values = reviews
    .map((review) => review[fieldName])
    .filter((value) => value !== null && value !== undefined && value !== "");

  if (values.length === 0) return null;

  const sum = values.reduce((total, value) => total + Number(value), 0);
  return (sum / values.length).toFixed(1);
}

function formatRating(value) {
  if (!value) return "Not rated yet";
  return `${value}/5`;
}
function formatPriceLevel(value) {
  if (!value) return "Not rated yet";

  const number = Number(value);

  if (number <= 3) return "€ Cheap";
  if (number <= 6) return "€€ Moderate";
  if (number <= 8) return "€€€ Pricey";
  return "€€€€ Expensive";
}
function formatRatingLabel(value) {
  if (!value) return "Not rated yet";

  const number = Number(value);

  if (number < 2) return `Bad · ${number.toFixed(1)}/5`;
  if (number < 3) return `Okay · ${number.toFixed(1)}/5`;
  if (number < 4) return `Good · ${number.toFixed(1)}/5`;
  if (number < 4.5) return `Very good · ${number.toFixed(1)}/5`;
  return `Amazing · ${number.toFixed(1)}/5`;
}

function scrollToReviewForm() {
  const reviewSection = document.getElementById("review-form-section");
  if (reviewSection) {
    reviewSection.scrollIntoView({ behavior: "smooth" });
  }
}



function sharePlace() {
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({
      title: place.name,
      text: `Check out ${place.name} on Study Spots`,
      url: url,
    });
  } else {
    navigator.clipboard.writeText(url);
    alert("Link copied!");
  }
}
function getYesPercentage(fieldName) {
  const values = reviews
    .map((review) => review[fieldName])
    .filter((value) => value !== null && value !== undefined);

  if (values.length === 0) return null;

  const yesCount = values.filter(Boolean).length;
  return Math.round((yesCount / values.length) * 100);
}

function getMostCommon(fieldName) {
  const values = reviews
    .map((review) => review[fieldName])
    .filter(Boolean);

  if (values.length === 0) return null;

  const counts = {};

  values.forEach((value) => {
    counts[value] = (counts[value] || 0) + 1;
  });

  return Object.keys(counts).reduce((a, b) =>
    counts[a] > counts[b] ? a : b
  );
}

function getRatingCount(star) {
  return reviews.filter((review) => Number(review.rating) === star).length;
}

const ratingCounts = {
  5: getRatingCount(5),
  4: getRatingCount(4),
  3: getRatingCount(3),
  2: getRatingCount(2),
  1: getRatingCount(1),
};

const maxRatingCount = Math.max(...Object.values(ratingCounts), 1);

  return (
   <div className="place-detail-new">
     <a href="/" className="place-back-link">
      ← Back to places
    </a>

  <div className="place-gallery">
    {place.image_url ? (
      <img className="place-main-image" src={place.image_url} alt={place.name} />
    ) : (
      <div className="place-main-image-placeholder">No image yet</div>
    )}
  </div>

  <div className="place-title-row">
    <div>
      <h1>{place.name}</h1>
      <p>
        {place.category} · {place.city}, {place.country}
      </p>
    </div>

    <div className="place-big-rating">
      <strong>{averageStudyRating || "—"}</strong>
      <span>
        ⭐ {averageStudyRating ? `${averageStudyRating}/5` : "No reviews"}
      </span>
    </div>
  </div>

  <div className="place-action-row">
    <button type="button" className="place-action-button">
      ♡ Save
    </button>

    <button
      type="button"
      className="place-action-button"
      onClick={scrollToReviewForm}
    >
      ✎ Review
    </button>

    <button
      type="button"
      className="place-action-button"
      onClick={sharePlace}
    >
      ⤴ Share
    </button>
  </div>

  <p className="place-detail-description">
    {place.description || "No description added yet."}
  </p>
  
      <div className="place-main-info-grid">
  <div className="place-info-card">
    <span>💻</span>
    <strong>WiFi</strong>
    <p>{formatRatingLabel(averageWifiRating)}</p>
  </div>

  <div className="place-info-card">
    <span>🔌</span>
    <strong>Power outlets</strong>
    <p>{formatRatingLabel(averageOutletsRating)}</p>
  </div>

  <div className="place-info-card">
    <span>🤫</span>
    <strong>Quietness</strong>
    <p>{formatRatingLabel(averageNoiseRating)}</p>
  </div>

  <div className="place-info-card">
    <span>🪑</span>
    <strong>Seating</strong>
    <p>{formatRatingLabel(averageSeatingRating)}</p>
  </div>

    <div className="place-info-card">
  <span>💻</span>
  <strong>Laptop</strong>
  <p>
    {laptopFriendlyPercentage !== null
      ? `${laptopFriendlyPercentage}% say yes`
      : "Not rated yet"}
  </p>
</div>

  <div className="place-info-card">
    <span>💸</span>
    <strong>Price</strong>
    <p>{formatPriceLevel(averagePriceRating)}</p>
  </div>
</div>
<section className="place-ratings-section">
  <div className="ratings-overall-card">
  <h3>Overall</h3>

  <div className="ratings-big-number">
    {averageStudyRating || "—"}
  </div>

  <p>
    ⭐ {averageStudyRating ? `${averageStudyRating}/5` : "No reviews yet"}
  </p>

  <small>{reviews.length} reviews</small>

  <div className="rating-distribution">
    {[5, 4, 3, 2, 1].map((star) => (
      <div className="rating-distribution-row" key={star}>
        <span>{star}★</span>

        <div className="rating-distribution-bar">
          <div
            className="rating-distribution-fill"
            style={{
              width: `${(ratingCounts[star] / maxRatingCount) * 100}%`,
            }}
          ></div>
        </div>

        <strong>{ratingCounts[star]}</strong>
      </div>
    ))}
  </div>
</div>

  <div className="ratings-breakdown-card">
    <h3>Ratings</h3>

    <div className="rating-row">
      <span>WiFi quality</span>
      <strong>{formatRating(averageWifiRating)}</strong>
    </div>

    <div className="rating-row">
      <span>Power outlets</span>
      <strong>{formatRating(averageOutletsRating)}</strong>
    </div>

    <div className="rating-row">
      <span>Quietness</span>
      <strong>{formatRating(averageNoiseRating)}</strong>
    </div>

    <div className="rating-row">
      <span>Seating</span>
      <strong>{formatRating(averageSeatingRating)}</strong>
    </div>

    <div className="rating-row">
      <span>Crowdedness</span>
      <strong>{formatRating(averageCrowdednessRating)}</strong>
    </div>

    <div className="rating-row">
      <span>Price level</span>
      <strong>
        {averagePriceRating ? `${averagePriceRating}/10` : "Not rated yet"}
      </strong>
    </div>
  </div>
</section>

      <div className="reviews-section">
        <div id="review-form-section">
          <ReviewForm
            placeId={place.id}
            session={session}
            onReviewAdded={fetchReviews}
          />
        </div>

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