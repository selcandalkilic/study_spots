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
  const [reviewImages, setReviewImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  async function uploadReviewPhotos({ reviewId }) {
  if (!reviewImages.length || !session?.user?.id) return [];

  setUploadingImages(true);

  const uploadedPhotos = [];

  for (const file of reviewImages) {
    const fileExtension = file.name.split(".").pop();
    const filePath = `${session.user.id}/${placeId}/${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("review-images")
      .upload(filePath, file);

    if (uploadError) {
      console.log("Review photo upload error:", uploadError);
      continue;
    }

    const { data } = supabase.storage
      .from("review-images")
      .getPublicUrl(filePath);

    uploadedPhotos.push({
      place_id: placeId,
      review_id: reviewId,
      user_id: session.user.id,
      image_url: data.publicUrl,
    });
  }

  if (uploadedPhotos.length > 0) {
    const { error } = await supabase
      .from("review_photos")
      .insert(uploadedPhotos);

    if (error) {
      console.log("Review photo insert error:", error);
    }
  }

  setUploadingImages(false);
  return uploadedPhotos;
}

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
      
    const { data: newReview, error } = await supabase
        .from("reviews")
        .insert([
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
            laptop_friendly: laptopFriendly,
            comment: comment,
            is_anonymous: isAnonymous,
          },
        ])
        .select()
        .single();


    if (error) {
  alert(error.message);
} else {
  const uploadedPhotos = await uploadReviewPhotos({
    reviewId: newReview.id,
  });

  if (uploadedPhotos.length > 0) {
    const { data: placeData } = await supabase
      .from("places")
      .select("image_url, cover_photo_url")
      .eq("id", placeId)
      .single();

    if (!placeData?.image_url && !placeData?.cover_photo_url) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, full_name")
        .eq("id", session.user.id)
        .single();

      const credit =
        profileData?.username ||
        profileData?.full_name ||
        session.user.email ||
        "Study Spots user";

      await supabase
        .from("places")
        .update({
          cover_photo_url: uploadedPhotos[0].image_url,
          cover_photo_credit: credit,
          cover_photo_source: "review",
        })
        .eq("id", placeId);
    }
  }

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
  setReviewImages([]);
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
            <div className="review-photo-upload">
  <div>
    <label>Review photos</label>
          <p>Add photos of the study spot. You can upload more than one.</p>
        </div>

        <label className="review-photo-upload-button">
          Choose photos
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setReviewImages(Array.from(e.target.files))}
          />
        </label>
      </div>

      {reviewImages.length > 0 && (
        <p className="review-photo-count">
          {reviewImages.length} photo{reviewImages.length > 1 ? "s" : ""} selected
        </p>
      )}

      
      <button type="submit" disabled={uploadingImages}>
        {uploadingImages ? "Uploading photos..." : "Submit review"}
      
      </button>
    </form>
  );
}



export default ReviewForm;