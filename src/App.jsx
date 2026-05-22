import { useEffect, useState } from "react";
import StudyMap from "./components/StudyMap";
import "./App.css";
import PlaceList from "./components/PlaceList";
import PlaceDetails from "./components/PlaceDetails";
import { supabase } from "./supabaseClient";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PlacePage from "./pages/PlacePage";
import Navbar from "./components/Navbar";
import ProfilePage from "./pages/ProfilePage";
import AddSpotPage from "./pages/AddSpotPage";
import ImportOsmPage from "./pages/ImportOsmPage";

function App() {
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [language, setLanguage] = useState("EN");
  const text = {
  EN: {
    heroTitle: "Find the perfect place to focus.",
    heroSubtitle:
      "Discover study-friendly cafes, libraries, and workspaces in Linz, Vienna and Istanbul.",
    all: "All",
    allCategories: "All categories",
    library: "Library",
    cafe: "Cafe",
    university: "University",
    other: "Other",
    placesFound: "places found",
    topPlaces: "Top study spots based on your filters",
  },
  DE: {
    heroTitle: "Finde den perfekten Ort zum Lernen.",
    heroSubtitle:
      "Entdecke lernfreundliche Cafés, Bibliotheken und Arbeitsplätze in Linz, Wien und Istanbul.",
    all: "Alle",
    allCategories: "Alle Kategorien",
    library: "Bibliothek",
    cafe: "Café",
    university: "Universität",
    other: "Andere",
    placesFound: "Orte gefunden",
    topPlaces: "Top-Lernorte basierend auf deinen Filtern",
  },
  TR: {
    heroTitle: "Odaklanmak için mükemmel yeri bul.",
    heroSubtitle:
      "Linz, Viyana ve İstanbul’daki çalışma dostu kafeleri, kütüphaneleri ve çalışma alanlarını keşfedin.",
    all: "Tüm",
    allCategories: "Tüm kategoriler",
    library: "Kütüphane",
    cafe: "Kafe",
    university: "Üniversite",
    other: "Diğer",
    placesFound: "yer bulundu",
    topPlaces: "Filtrelerinize göre en iyi çalışma alanları",
  },
};

const t = text[language];

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
          <Navbar
            searchText={searchText}
            setSearchText={setSearchText}
            session={session}
            language={language}
            setLanguage={setLanguage}
          />

          <section className="hero-section">
  <div className="hero-text">
      <h1>{t.heroTitle}</h1>
      <p>{t.heroSubtitle}</p>
  </div>
</section>

<section className="filter-section">
  <div className="filter-group">
    <button
      className={selectedCity === "All" ? "filter-chip active" : "filter-chip"}
      onClick={() => setSelectedCity("All")}
    >
      {t.all}
    </button>

    <button
      className={selectedCity === "Linz" ? "filter-chip active" : "filter-chip"}
      onClick={() => setSelectedCity("Linz")}
    >
      Linz
    </button>

    <button
      className={
        selectedCity === "Istanbul" ? "filter-chip active" : "filter-chip"
      }
      onClick={() => setSelectedCity("Istanbul")}
    >
      Istanbul
    </button>

    <button
      className={selectedCity === "Vienna" ? "filter-chip active" : "filter-chip"}
      onClick={() => setSelectedCity("Vienna")}
    >
      Vienna
    </button>
  </div>

  <div className="filter-group">
    <button
      className={
        selectedCategory === "All" ? "filter-chip active" : "filter-chip"
      }
      onClick={() => setSelectedCategory("All")}
    >
      All categories
    </button>

    <button
      className={
        selectedCategory === "Library" ? "filter-chip active" : "filter-chip"
      }
      onClick={() => setSelectedCategory("Library")}
    >
      Library
    </button>

    <button
      className={
        selectedCategory === "Cafe" ? "filter-chip active" : "filter-chip"
      }
      onClick={() => setSelectedCategory("Cafe")}
    >
      Cafe
    </button>

    <button
      className={
        selectedCategory === "University" ? "filter-chip active" : "filter-chip"
      }
      onClick={() => setSelectedCategory("University")}
    >
      University
    </button>

    <button
      className={
        selectedCategory === "Other" ? "filter-chip active" : "filter-chip"
      }
      onClick={() => setSelectedCategory("Other")}
    >
      Other
    </button>
  </div>
</section>

<section className="map-preview-section">
  <div className="top-places-panel">
    <div className="top-places-header">
      <h2>
        {filteredPlaces.length} {t.placesFound}
      </h2>
      <p>{t.topPlaces}</p>
    </div>

    <div className="top-places-list">
      {filteredPlaces.slice(0, 4).map((place) => (
        <Link
          to={`/places/${place.id}`}
          className="top-place-card"
          key={place.id}
        >
          {place.image_url ? (
            <img src={place.image_url} alt={place.name} />
          ) : (
            <div className="top-place-placeholder">No image</div>
          )}

          <div className="top-place-info">
            <h3>{place.name}</h3>
            <p>{place.city}, {place.country}</p>

            <div className="top-place-rating">
              <span className="score-badge">
                {place.study_rating ? place.study_rating : "—"}
              </span>
              <span>
                ⭐ {place.study_rating ? `${place.study_rating}/5` : "Not rated"}
              </span>
            </div>

            <div className="top-place-tags">
              {place.quiet && <span>Quiet</span>}
              {place.wifi && <span>WiFi</span>}
              {place.outlets && <span>Outlets</span>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>

  <div className="map-panel">
    <StudyMap
      places={filteredPlaces}
      onSelectPlace={setSelectedPlace}
    />
  </div>
</section>

            <PlaceList places={filteredPlaces} />
          </div>
        }
      />

      <Route path="/login" element={<LoginPage session={session} />} />
      <Route path="/places/:id" element={<PlacePage session={session} />} />
      <Route path="/profile" element={<ProfilePage session={session} />} />
      <Route path="/add-spot" element={<AddSpotPage session={session} />} />
      <Route path="/import-osm" element={<ImportOsmPage session={session} />} />
    </Routes>
  </BrowserRouter>
);
}

export default App;