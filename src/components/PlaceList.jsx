function PlaceList({ places , onSelectPlace}) {
  return (
    <div className="place-list">
      <h2>Study Places</h2>

      {places.map((place) => (
        <div className="place-card" key={place.id}>
          <h3>{place.name}</h3>
          <p>{place.city}, {place.country}</p>
          <p>{place.description}</p>
          <p>Category: {place.category}</p>
          <p>WiFi: {place.wifi ? "Yes" : "No"}</p>
          <p>Quiet: {place.quiet ? "Yes" : "No"}</p>
          <p>Study rating: {place.study_rating}/5</p>
        <p>WiFi quality: {place.wifi_quality}</p>
        <p>Outlets: {place.outlets}</p>
        <p>Noise level: {place.noise_level}</p>
        <p>Seating: {place.seating}</p>
        <p>Opening hours: {place.opening_hours}</p>
        <p>Study rating: {place.study_rating ? `${place.study_rating}/5` : "Not rated yet"}</p>
          <button onClick={() => onSelectPlace(place)}>
  View details
</button>
        </div>
      ))}
    </div>
  );
}

export default PlaceList;