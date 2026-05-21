import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function StudyMap({ places, onSelectPlace }) {
  const isMobile = window.innerWidth <= 768;

  function getMarkerColor(category) {
  if (category === "Library") return "#6f5b86";
  if (category === "Cafe") return "#2f9e44";
  if (category === "University") return "#2563eb";
  return "#f59f00";
}

function createCategoryIcon(category) {
  const color = getMarkerColor(category);

  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div style="
        background:${color};
        width:28px;
        height:28px;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid white;
        box-shadow:0 4px 12px rgba(0,0,0,0.25);
      ">
        <div style="
          width:10px;
          height:10px;
          background:white;
          border-radius:50%;
          margin:6px;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}
  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        center={[48.3069, 14.2858]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        dragging={true}
        touchZoom={true}
        scrollWheelZoom={false}
        doubleClickZoom={true}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {places.map((place) => (
          <Marker
  key={place.id}
  position={[place.latitude, place.longitude]}
   icon={createCategoryIcon(place.category)}
  eventHandlers={{
  click: () => onSelectPlace(place),
  }}
>
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