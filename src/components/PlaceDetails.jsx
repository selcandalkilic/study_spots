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

        <div>
  <strong>Study rating</strong>
  <p>{place.studyRating}/5</p>
</div>

<div>
  <strong>WiFi quality</strong>
  <p>{place.wifiQuality}</p>
</div>

<div>
  <strong>Power outlets</strong>
  <p>{place.outlets}</p>
</div>

<div>
  <strong>Noise level</strong>
  <p>{place.noiseLevel}</p>
</div>

<div>
  <strong>Seating</strong>
  <p>{place.seating}</p>
</div>

<div>
  <strong>Laptop friendly</strong>
  <p>{place.laptopFriendly ? "Yes" : "No"}</p>
</div>

<div>
  <strong>Solo study</strong>
  <p>{place.soloStudy ? "Yes" : "No"}</p>
</div>

<div>
  <strong>Group study</strong>
  <p>{place.groupStudy ? "Yes" : "No"}</p>
</div>

<div>

  <strong>Best time to study</strong>

  <p>{place.bestTimeToStudy}</p>

</div>

<div>

  <strong>Crowded times</strong>

  <p>{place.crowdedTimes}</p>

</div>
      </div>
    </div>
  );
}

export default PlaceDetails;