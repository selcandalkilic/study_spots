import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function StudyMap({ places = [] }) {
  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        center={[48.3069, 14.2858]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {places.map((place) => (
          <Marker key={place.id} position={[place.latitude, place.longitude]}>
            <Popup>
              <strong>{place.name}</strong>
              <br />
              {place.city}, {place.country}
              <br />
              Category: {place.category}
              <br />
              WiFi: {place.wifi ? "Yes" : "No"}
              <br />
              Quiet: {place.quiet ? "Yes" : "No"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default StudyMap;