import { useEffect, useState } from "react";
import StudyMap from "./components/StudyMap";
import "./App.css";
import PlaceList from "./components/PlaceList";
import PlaceDetails from "./components/PlaceDetails";
import { supabase } from "./supabaseClient";
import Navbar from "./components/Navbar";

function App() {
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [places, setPlaces] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchPlaces() {
   const { data, error } = await supabase
  .from("places")
  .select("*");

  console.log("Supabase places:", data);
console.log("Supabase error:", error);

    if (error) {
      console.error("Error fetching places:", error);
    } else {
      setPlaces(data);
    }

    setLoading(false);
  }

  fetchPlaces();
}, []);



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

if (loading) {
  return <p>Loading places...</p>;
}
   
  return (
    <div>
      <Navbar />
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
      {selectedPlace ? (
  <PlaceDetails
    place={selectedPlace}
    onClose={() => setSelectedPlace(null)}
  />
) : (
  <PlaceList
    places={filteredPlaces}
    onSelectPlace={setSelectedPlace}
  />
)}
    </div>
  );
}

export default App;