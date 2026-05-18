import { useState } from "react";
import StudyMap from "./components/StudyMap";
import places from "./data/places.json";
import "./App.css";
import PlaceList from "./components/PlaceList";

function App() {
  const [selectedCity, setSelectedCity] = useState("All");

  const filteredPlaces =
    selectedCity === "All"
      ? places
      : places.filter((place) => place.city === selectedCity);

  return (
    <div>
      <h1>Study Spots</h1>
      <p>Find study-friendly places in Linz and Istanbul.</p>

      <div>
        <button onClick={() => setSelectedCity("All")}>All</button>
        <button onClick={() => setSelectedCity("Linz")}>Linz</button>
        <button onClick={() => setSelectedCity("Istanbul")}>Istanbul</button>
      </div>

      <StudyMap places={filteredPlaces} />
      <PlaceList places={filteredPlaces} />
    </div>
  );
}

export default App;