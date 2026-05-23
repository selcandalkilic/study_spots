import { useState } from "react";
import { supabase } from "../supabaseClient";

function StarRating({ label, value, onChange, max = 5, required = false }) {
  return (
    <div className="review-rating-field">
      <label>
        {label} {required && <span>*</span>}
      </label>

      <div className="review-stars">
        {Array.from({ length: max }, (_, index) => index + 1).map((star) => (
          <button
            key={star}
            type="button"
            className={star <= value ? "review-star active" : "review-star"}
            onClick={() => onChange(star)}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewForm({ placeId, session, onReviewAdded }) {
  const [rating, setRating] = useState(0);
  const [wifiRating, setWifiRating] = useState(0);
  const [outletsRating, setOutletsRating] = useState(0);
  const [noiseRating, setNoiseRating] = useState(0);
  const [seatingRating, setSeatingRating] = useState(0);
  const [crowdednessRating, setCrowdednessRating] = useState(0);
  const [priceRating, setPriceRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [seatingType, setSeatingType] = useState("");
  const [laptopFriendly, setLaptopFriendly] = useState(null);

  async function submitReview(event) {
    event.preventDefault();

    if (!session) {
      alert("Please log in first.");
      return;
    }

    if (rating === 0) {
      alert("Please choose an overall rating.");
      return;
    }

    const { error } = await supabase.from("reviews").insert([
      {
        place_id: placeId,
        user_id: session.user.id,
        rating: Number(rating),
        wifi_rating: wifiRating || null,
        outlets_rating: outletsRating || null,
        noise_rating: noiseRating || null,
        seating_rating: seatingRating || null,
        seating_type: seatingType || null,
        crowdedness_rating: crowdednessRating || null,
        price_rating: priceRating || null,
        comment: comment,
        is_anonymous: isAnonymous,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      setRating(0);
      setWifiRating(0);
      setOutletsRating(0);
      setNoiseRating(0);
      setSeatingRating(0);
      setCrowdednessRating(0);
      setPriceRating(0);
      setComment("");
      setIsAnonymous(false);
      setSeatingType("");
      onReviewAdded();
      setLaptopFriendly(false);
    }
  }

  return (
    <form className="review-form improved-review-form" onSubmit={submitReview}>
      <div className="review-form-header">
        <h3>Write a review</h3>
        <p>Only the overall rating is required. The rest is optional.</p>
      </div>

      <StarRating
        label="Overall study rating"
        value={rating}
        onChange={setRating}
        required={true}
      />

      <div className="optional-review-section">
        <h4>Optional details</h4>

        <StarRating
          label="WiFi quality"
          value={wifiRating}
          onChange={setWifiRating}
        />

        <StarRating
          label="Power outlets"
          value={outletsRating}
          onChange={setOutletsRating}
        />

        <StarRating
          label="Quietness"
          value={noiseRating}
          onChange={setNoiseRating}
        />


        <StarRating
                  label="Crowdedness"
                  value={crowdednessRating}
                  onChange={setCrowdednessRating}
                />

        <label className="review-option-title">Laptop friendly</label>
        
        <div className="choice-row">
          <button
            type="button"
            className={laptopFriendly === true ? "choice-button active" : "choice-button"}
            onClick={() => setLaptopFriendly(true)}
          >
            {laptopFriendly === true ? "✓ " : ""}
            Yes
          </button>

          

          <button
            type="button"
            className={laptopFriendly === false ? "choice-button active" : "choice-button"}
            onClick={() => setLaptopFriendly(false)}
          >
            {laptopFriendly === false ? "✓ " : ""}
            No
          </button>
        </div>

        <StarRating
          label="Seating availability"
          value={seatingRating}
          onChange={setSeatingRating}
        />
        <label className="review-option-title">Seating type</label>

<div className="choice-row">
  {["Indoor", "Outdoor", "Both"].map((option) => (
    <button
        key={option}
        type="button"
        className={
          seatingType === option ? "choice-button active" : "choice-button"
        }
        onClick={() => setSeatingType(option)}
      >
        {seatingType === option ? "✓ " : ""}
        {option}
      </button>
  ))}
</div>

        <div className="review-price-field">
          <label>Price level</label>

         <div className="price-choice-row">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
            <button
              key={number}
              type="button"
              className={
                Number(priceRating) === number
                  ? "price-choice active"
                  : "price-choice"
              }
              onClick={() => setPriceRating(number)}
            >
              {Number(priceRating) === number ? "✓ " : ""}
              {number}
            </button>
          ))}
        </div>

          <p>1 = very cheap, 10 = very expensive</p>
        </div>
      </div>

      <label className="review-option-title">Comment</label>
      <textarea
        placeholder="What should other students know about this place?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <label className="anonymous-checkbox">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
        />
        Hide my username
      </label>

      <button type="submit">Submit review</button>
    </form>
  );
}

export default ReviewForm;