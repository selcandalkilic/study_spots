import { useEffect, useState } from "react";
import StudyMap from "./components/StudyMap";
import "./App.css";
import PlaceList from "./components/PlaceList";
import PlaceDetails from "./components/PlaceDetails";
import { supabase } from "./supabaseClient";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";

function App() {
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

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
      setPlaces(data || []);   
    }

    setLoading(false);
  }

  fetchPlaces();
}, []);

 useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
  });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  return () => subscription.unsubscribe();
}, []);



const filteredPlaces = places.filter((place) => {
  const cityMatches =
    selectedCity === "All" || place.city === selectedCity;

  const categoryMatches =
    selectedCategory === "All" || place.category === selectedCategory;

  const name = place.name || "";
  const city = place.city || "";
  const category = place.category || "";
  const description = place.description || "";

  const searchMatches =
    name.toLowerCase().includes(searchText.toLowerCase()) ||
    city.toLowerCase().includes(searchText.toLowerCase()) ||
    category.toLowerCase().includes(searchText.toLowerCase()) ||
    description.toLowerCase().includes(searchText.toLowerCase());

  return cityMatches && categoryMatches && searchMatches;
});

if (loading) {
  return <p>Loading places...</p>;
}

return (
  <BrowserRouter>
    <Routes>
      <Route
        path="/"
        element={
          <div>
            <h1>Study Spots</h1>
            <p>Find study-friendly places in Linz and Istanbul.</p>

            <div className="top-auth-area">
              {session ? (
                <>
                  <span>Logged in as: {session.user.email}</span>
                  <button onClick={() => supabase.auth.signOut()}>
                    Log out
                  </button>
                </>
              ) : (
                <Link to="/login">
                  <button>Login</button>
                </Link>
              )}
            </div>

            <div className="filter-buttons">
              <button onClick={() => setSelectedCity("All")}>All</button>
              <button onClick={() => setSelectedCity("Linz")}>Linz</button>
              <button onClick={() => setSelectedCity("Istanbul")}>
                Istanbul
              </button>
            </div>

            <div className="filter-buttons">
              <button onClick={() => setSelectedCategory("All")}>
                All categories
              </button>
              <button onClick={() => setSelectedCategory("Library")}>
                Library
              </button>
              <button onClick={() => setSelectedCategory("Cafe")}>Cafe</button>
              <button onClick={() => setSelectedCategory("University")}>
                University
              </button>
              <button onClick={() => setSelectedCategory("Other")}>
                Other
              </button>
            </div>

            <div className="search-box">
              <input
                type="text"
                placeholder="Search study spots..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>

            

            <StudyMap
                  places={filteredPlaces}
                  onSelectPlace={setSelectedPlace}
                />

            {selectedPlace ? (
              <PlaceDetails
                place={selectedPlace}
                onClose={() => setSelectedPlace(null)}
                session={session}
/>
            ) : (
              <PlaceList
                places={filteredPlaces}
                onSelectPlace={setSelectedPlace}
              />
            )}
          </div>
        }
      />

      <Route path="/login" element={<LoginPage session={session} />} />
    </Routes>
  </BrowserRouter>
);
}

export default App;