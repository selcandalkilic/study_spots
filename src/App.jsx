import { useState } from "react";
import StudyMap from "./components/StudyMap";
import places from "./data/places.json";
import "./App.css";
import PlaceList from "./components/PlaceList";

function App() {
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchText, setSearchText] = useState("");

  const filteredPlaces = places.filter((place) => {
  const cityMatches =
    selectedCity === "All" || place.city === selectedCity;

  const categoryMatches =
    selectedCategory === "All" || place.category === selectedCategory;

  const searchMatches =
    place.name.toLowerCase().includes(searchText.toLowerCase()) ||
    place.city.toLowerCase().includes(searchText.toLowerCase()) ||
    place.category.toLowerCase().includes(searchText.toLowerCase()) ||
    place.description.toLowerCase().includes(searchText.toLowerCase());

  return cityMatches && categoryMatches && searchMatches;
});
   
  return (
    <div>
      <h1>Study Spots</h1>
      <p>Find study-friendly places in Linz and Istanbul.</p>

      <div  className="filter-buttons">
        <button onClick={() => setSelectedCity("All")}>All</button>
        <button onClick={() => setSelectedCity("Linz")}>Linz</button>
        <button onClick={() => setSelectedCity("Istanbul")}>Istanbul</button>
        </div>

      <div className="filter-buttons">
        <button onClick={() => setSelectedCategory("All")}>All categories</button>
        <button onClick={() => setSelectedCategory("Library")}>Library</button>
        <button onClick={() => setSelectedCategory("Cafe")}>Cafe</button>
        <button onClick={() => setSelectedCategory("University")}>University</button>
        <button onClick={() => setSelectedCategory("Other")}>Other</button>
      </div>

      <div className="search-box">
  <input
    type="text"
    placeholder="Search study spots..."
    value={searchText}
    onChange={(event) => setSearchText(event.target.value)}
  />
</div>
      

      <StudyMap places={filteredPlaces} />
      <PlaceList places={filteredPlaces} />
    </div>
  );
}

export default App;