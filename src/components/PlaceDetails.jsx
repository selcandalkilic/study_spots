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
          <p>{place.openingHours}</p>
        </div>

        <div>
          <strong>Category</strong>
          <p>{place.category}</p>
        </div>
      </div>
    </div>
  );
}

export default PlaceDetails;