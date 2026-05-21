import { useState } from "react";
import { supabase } from "../supabaseClient";

function ReviewForm({ placeId, session, onReviewAdded }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  async function submitReview(event) {
    event.preventDefault();

    if (!session) {
      alert("Please log in first.");
      return;
    }

    const { error } = await supabase.from("reviews").insert([
      {
        place_id: placeId,
        user_id: session.user.id,
        rating: Number(rating),
        comment: comment,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      setRating(5);
      setComment("");
      onReviewAdded();
    }
  }

  return (
    <form className="review-form" onSubmit={submitReview}>
      <h3>Write a review</h3>

      <select value={rating} onChange={(e) => setRating(e.target.value)}>
        <option value="5">5 stars</option>
        <option value="4">4 stars</option>
        <option value="3">3 stars</option>
        <option value="2">2 stars</option>
        <option value="1">1 star</option>
      </select>

      <textarea
        placeholder="How was this study spot?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button type="submit">Submit review</button>
    </form>
  );
}

export default ReviewForm;