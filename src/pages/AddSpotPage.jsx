import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import StudyMap from "../components/StudyMap";

function StarRating({ label, value, onChange }) {
  return (
    <div className="star-rating-field">
      <label>{label}</label>

      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={star <= value ? "star-button active" : "star-button"}
            onClick={() => onChange(star)}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

function AddSpotPage({ session }) {
  const navigate = useNavigate();

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const timeOptions = [
    "Closed",
    "06:00", "06:30",
    "07:00", "07:30",
    "08:00", "08:30",
    "09:00", "09:30",
    "10:00", "10:30",
    "11:00", "11:30",
    "12:00", "12:30",
    "13:00", "13:30",
    "14:00", "14:30",
    "15:00", "15:30",
    "16:00", "16:30",
    "17:00", "17:30",
    "18:00", "18:30",
    "19:00", "19:30",
    "20:00", "20:30",
    "21:00", "21:30",
    "22:00", "22:30",
    "23:00", "23:30",
    "00:00",
  ];
  const bestTimeOptions = [
  "Early morning",
  "Morning",
  "Noon",
  "Afternoon",
  "Evening",
  "Late night",
  "All day",
];

  const [form, setForm] = useState({
    name: "",
    city: "",
    country: "",
    category: "Cafe",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    image_url: "",
    opening_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opening_time: "09:00",
    closing_time: "18:00",
    study_rating: 5,
    wifi_rating: 5,
    outlets_rating: 5,
    noise_rating: 5,
    seating_rating: 5,
    crowdedness_rating: 3,
    price_rating: 5,
    wifi: true,
    laptop_friendly: true,
    solo_study: true,
    group_study: false,
    best_time_to_study: "Morning",
    comment: "",
  });

  const [addressResults, setAddressResults] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
  }

  function toggleDay(day) {
    if (form.opening_days.includes(day)) {
      updateField(
        "opening_days",
        form.opening_days.filter((item) => item !== day)
      );
    } else {
      updateField("opening_days", [...form.opening_days, day]);
    }
  }

  async function searchAddress() {
    if (!form.address) {
      alert("Please type an address first.");
      return;
    }

    setSearchingAddress(true);

    const query = encodeURIComponent(form.address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`
    );

    const data = await response.json();

    setAddressResults(data);
    setSearchingAddress(false);

    if (data.length === 0) {
      alert("No address found. Try writing the address more clearly.");
    }
  }

  function confirmAddress(result) {
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    setSelectedAddress(result);

    setForm({
      ...form,
      address: result.display_name,
      latitude,
      longitude,
    });
  }
  async function uploadPlaceImage(event) {
  const file = event.target.files[0];

  if (!file || !session) {
    return;
  }

  setUploadingImage(true);

  const fileExtension = file.name.split(".").pop();
  const filePath = `${session.user.id}/${Date.now()}.${fileExtension}`;

  const { error } = await supabase.storage
    .from("place-images")
    .upload(filePath, file);

  if (error) {
    alert(error.message);
    setUploadingImage(false);
    return;
  }

  const { data } = supabase.storage
    .from("place-images")
    .getPublicUrl(filePath);

  updateField("image_url", data.publicUrl);
  setUploadingImage(false);
}

  async function submitSpot(event) {
    event.preventDefault();

    if (!session) {
      alert("Please log in first.");
      navigate("/login");
      return;
    }

    if (!form.name || !form.city || !form.country || !form.address) {
      alert("Please fill in name, city, country and address.");
      return;
    }

    if (!form.latitude || !form.longitude) {
      alert("Please search and confirm the address on the map first.");
      return;
    }


    setSaving(true);

    const openingHours =
      form.opening_time === "Closed" || form.closing_time === "Closed"
        ? "Closed"
        : `${form.opening_days.join(", ")} ${form.opening_time}-${form.closing_time}`;

    const { data: newPlace, error: placeError } = await supabase
      .from("places")
      .insert([
        {
          name: form.name,
          city: form.city,
          country: form.country,
          category: form.category,
          description: form.description,
          address: form.address,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          image_url: form.image_url,
          wifi: form.wifi,
          quiet: form.noise_rating >= 4,
          opening_hours: openingHours,
          opening_days: form.opening_days,
          study_rating: Number(form.study_rating),
          wifi_quality: `${form.wifi_rating}/5`,
          outlets: `${form.outlets_rating}/5`,
          noise_level: `${form.noise_rating}/5`,
          seating: `${form.seating_rating}/5`,
          laptop_friendly: form.laptop_friendly,
          solo_study: form.solo_study,
          group_study: form.group_study,
          best_time_to_study: form.best_time_to_study,
          crowded_times: `${form.crowdedness_rating}/5 crowdedness`,
          price_rating: Number(form.price_rating),
          created_by: session.user.id,
          status: "approved",
        },
      ])
      .select()
      .single();

    if (placeError) {
      setSaving(false);
      alert(placeError.message);
      console.log("Add spot error:", placeError);
      return;
    }

    const { error: reviewError } = await supabase.from("reviews").insert([
     {
        place_id: newPlace.id,
        user_id: session.user.id,
        rating: Number(form.study_rating),
        wifi_rating: Number(form.wifi_rating),
        outlets_rating: Number(form.outlets_rating),
        noise_rating: Number(form.noise_rating),
        seating_rating: Number(form.seating_rating),
        crowdedness_rating: Number(form.crowdedness_rating),
        price_rating: Number(form.price_rating),
        comment:
            form.comment ||
            "Initial review from the person who added this study spot.",
        },
    ]);

    setSaving(false);

    if (reviewError) {
      alert(
        "Place was added, but the first review could not be saved: " +
          reviewError.message
      );
      navigate("/");
    } else {
      alert("Study spot added!");
      navigate("/");
    }
  }

  if (!session) {
    return (
      <div className="add-spot-page">
        <div className="add-spot-card">
          <h1>Add a Spot</h1>
          <p>You need to log in before adding a study spot.</p>
          <Link to="/login" className="navbar-login-button">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  const previewPlace =
    form.latitude && form.longitude
      ? [
          {
            id: "preview",
            name: form.name || "New study spot",
            city: form.city,
            country: form.country,
            category: form.category,
            latitude: Number(form.latitude),
            longitude: Number(form.longitude),
            wifi: form.wifi,
            quiet: form.quiet,
          },
        ]
      : [];

  return (
    <div className="add-spot-page">
      <div className="add-spot-card">
        <Link to="/" className="back-home-link">
          ← Back to homepage
        </Link>

        <h1>Add a Study Spot</h1>
        <p>Share a good study-friendly place with other students.</p>

        <form className="add-spot-form" onSubmit={submitSpot}>
          <label>Place name *</label>
          <input
            type="text"
            placeholder="Example: JKU Library"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
          

          <div className="form-two-columns">
            <div>
              <label>City *</label>
              <input
                type="text"
                placeholder="Linz"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
            </div>

            <div>
              <label>Country *</label>
              <input
                type="text"
                placeholder="Austria"
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
              />
            </div>
          </div>

          <label>Category</label>
          <select
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
          >
            <option>Cafe</option>
            <option>Library</option>
            <option>University</option>
            <option>Other</option>
          </select>

          <label>Description</label>
          <textarea
            placeholder="Why is this a good study spot?"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />

          <label>Address *</label>
          <div className="address-search-row">
            <input
              type="text"
              placeholder="Example: Karlsplatz 13, Vienna"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
            />

            <button type="button" onClick={searchAddress}>
              {searchingAddress ? "Searching..." : "Find address"}
            </button>
          </div>

          {addressResults.length > 0 && (
            <div className="address-results">
              {addressResults.map((result) => (
                <button
                  type="button"
                  key={result.place_id}
                  onClick={() => confirmAddress(result)}
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}

          {selectedAddress && (
            <div className="confirmed-address-box">
              <strong>Selected address:</strong>
              <p>{selectedAddress.display_name}</p>
            </div>
          )}

          {previewPlace.length > 0 && (
            <div className="location-preview-map">
              <StudyMap places={previewPlace} />
            </div>
          )}

          <div className="place-image-upload-box">
            <div>
                <label>Place image</label>
                <p>Upload a photo of the study spot.</p>
            </div>

            <label className="place-image-upload-button">
                Choose image
                <input type="file" accept="image/*" onChange={uploadPlaceImage} />
            </label>
            </div>

            {uploadingImage && <p className="uploading-text">Uploading image...</p>}

            {form.image_url && (
            <img
                className="place-image-preview"
                src={form.image_url}
                alt="Place preview"
            />
            )}

          <div className="opening-days-section">
            <label>Open days</label>

            <div className="day-chip-grid">
              {days.map((day) => (
                <button
                  type="button"
                  key={day}
                  className={
                    form.opening_days.includes(day)
                      ? "day-chip active"
                      : "day-chip"
                  }
                  onClick={() => toggleDay(day)}
                >
                  {form.opening_days.includes(day) ? "✓ " : ""}
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-two-columns">
            <div>
              <label>Opening time</label>
              <select
                value={form.opening_time}
                onChange={(e) => updateField("opening_time", e.target.value)}
              >
                {timeOptions.map((time) => (
                  <option key={time}>{time}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Closing time</label>
              <select
                value={form.closing_time}
                onChange={(e) => updateField("closing_time", e.target.value)}
              >
                {timeOptions.map((time) => (
                  <option key={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rating-section">
            <h2>Your first review</h2>
            <p>
              These ratings will be saved as your first review for this place.
            </p>

            <StarRating
              label="Overall study rating"
              value={form.study_rating}
              onChange={(value) => updateField("study_rating", value)}
            />

            <StarRating
              label="WiFi quality"
              value={form.wifi_rating}
              onChange={(value) => updateField("wifi_rating", value)}
            />

            <StarRating
              label="Power outlets"
              value={form.outlets_rating}
              onChange={(value) => updateField("outlets_rating", value)}
            />

            <StarRating
                label="Quietness"
                value={form.noise_rating}
                onChange={(value) => updateField("noise_rating", value)}
                />

                <StarRating
                label="Seating availability"
                value={form.seating_rating}
                onChange={(value) => updateField("seating_rating", value)}
                />

                <StarRating
                label="Crowdedness"
                value={form.crowdedness_rating}
                onChange={(value) => updateField("crowdedness_rating", value)}
                />
                <div className="price-rating-field">
                <label>Price level</label>

                <div className="price-rating">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                    <button
                        key={number}
                        type="button"
                        className={
                        number <= form.price_rating
                            ? "price-button active"
                            : "price-button"
                        }
                        onClick={() => updateField("price_rating", number)}
                    >
                        {number}
                    </button>
                    ))}
                </div>
                <p>1 = very cheap, 10 = very expensive</p>
                </div>

            <label>Review comment</label>
            <textarea
              placeholder="What should other students know about this place?"
              value={form.comment}
              onChange={(e) => updateField("comment", e.target.value)}
            />
          </div>

          <div className="checkbox-grid">
            <label>
              <input
                type="checkbox"
                checked={form.wifi}
                onChange={(e) => updateField("wifi", e.target.checked)}
              />
              WiFi available
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.laptop_friendly}
                onChange={(e) =>
                  updateField("laptop_friendly", e.target.checked)
                }
              />
              Laptop friendly
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.solo_study}
                onChange={(e) => updateField("solo_study", e.target.checked)}
              />
              Solo study
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.group_study}
                onChange={(e) => updateField("group_study", e.target.checked)}
              />
              Group study
            </label>
          </div>

          <label>Best time to study</label>
            <select
            value={form.best_time_to_study}
            onChange={(e) => updateField("best_time_to_study", e.target.value)}
            >
            {bestTimeOptions.map((time) => (
                <option key={time}>{time}</option>
            ))}
            </select>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Add Study Spot"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddSpotPage;