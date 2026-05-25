import FilterSection from "./components/FilterSection";
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
import SavedPlacesPage from "./pages/SavedPlacesPage";
import UserProfilePage from "./pages/UserProfilePage";
import FriendsPage from "./pages/FriendsPage";
import BottomNav from "./components/BottomNav";
import TimerPage from "./pages/TimerPage";
import EditPlacePage from "./pages/EditPlacePage";
import { Helmet } from "react-helmet-async";



function App() {
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [language, setLanguage] = useState("EN");
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [sortOption, setSortOption] = useState("recommended");
  const [userLocation, setUserLocation] = useState(null);
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
  .select("*")
  .eq("status", "approved");

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
  if (sortOption !== "closest") return;

  if (!navigator.geolocation) {
    alert("Your browser does not support location.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    (error) => {
      console.log("Location error:", error);
      alert("Location permission is needed to sort by closest.");
    }
  );
}, [sortOption]);

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



useEffect(() => {
  async function checkAdmin() {
    if (!session) {
      setIsAdmin(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.log("Admin check error:", error);
      setIsAdmin(false);
    } else {
      setIsAdmin(data?.is_admin === true);
    }
  }

  checkAdmin();
}, [session]);

function hasFeature(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value === null || value === undefined) {return false;}
  if (typeof value === "string") { 
    const normalized = value.toLowerCase().trim();
    if (["true","yes","y","available","has","some","many","few","limited","plenty"].includes(normalized)) {return true;}
    if (normalized.includes("/")) {
      const firstNumber = Number(normalized.split("/")[0]); 
      return firstNumber > 0;}
  }
  return false;
}
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function getPlaceDistance(place) {
  if (!userLocation || !place.latitude || !place.longitude) {
    return Infinity;
  }

  return getDistanceKm(
    userLocation.latitude,
    userLocation.longitude,
    Number(place.latitude),
    Number(place.longitude)
  );
}


const categoryOptions = ["All", "Cafe", "Library", "University", "Other"];

const filteredPlaces = places.filter((place) => {
  const normalizedSearch = searchText.toLowerCase().trim();

const searchMatches =
  normalizedSearch === "" ||
  place.name?.toLowerCase().includes(normalizedSearch) ||
  place.city?.toLowerCase().includes(normalizedSearch) ||
  place.country?.toLowerCase().includes(normalizedSearch) ||
  place.category?.toLowerCase().includes(normalizedSearch);

  const cityMatches =
  selectedCity === "All" ||
  place.city?.toLowerCase() === selectedCity.toLowerCase();

  const categoryMatches =
  selectedCategory === "All" ||
  place.category?.toLowerCase() === selectedCategory.toLowerCase();

  const placeRating = Number(place.study_rating || 0);

let ratingMatches = true;
if (selectedRating === 1) {ratingMatches = placeRating >= 1 && placeRating < 2;} 
else if (selectedRating === 2) {ratingMatches = placeRating >= 2 && placeRating < 3;} 
else if (selectedRating === 3) {ratingMatches = placeRating >= 3 && placeRating < 4;} 
else if (selectedRating === 4) {ratingMatches = placeRating >= 4 && placeRating < 4.8;} 
else if (selectedRating === 5) {ratingMatches = placeRating >= 4.8;}

const featureMatches = selectedFeatures.every((feature) => {
  if (feature === "Wi-Fi") return hasFeature(place.wifi);
  if (feature === "Outlets") return hasFeature(place.outlets);
  if (feature === "Quiet") return hasFeature(place.quiet);
  if (feature === "Laptop Friendly") return hasFeature(place.laptop_friendly);
  if (feature === "Long Study Friendly") return hasFeature(place.long_study_friendly);

  return true;
});

  return (
  searchMatches &&
  cityMatches &&
  categoryMatches &&
  ratingMatches &&
  featureMatches
);
});

function getReviewCount(place) {
  return Number(place.review_count || place.reviews_count || place.total_reviews || 0);
}

function getPlaceRating(place) {
  return Number(place.study_rating || place.average_rating || place.avg_rating || 0);
}

const sortedPlaces = [...filteredPlaces].sort((a, b) => {
  if (sortOption === "rating-high") {
    return getPlaceRating(b) - getPlaceRating(a);
  }

  if (sortOption === "most-reviewed") {
    return getReviewCount(b) - getReviewCount(a);
  }

  if (sortOption === "newest") {
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  }

  if (sortOption === "closest") {
  return getPlaceDistance(a) - getPlaceDistance(b);
}

  return 0;
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
          <Helmet>
            <title>Study Spots | Find Study-Friendly Cafes, Libraries and Workspaces</title>
            <meta
              name="description"
              content="Find study-friendly cafes, libraries, universities and workspaces in Linz, Vienna and Istanbul. Filter by WiFi, outlets, quietness and laptop-friendly places."
            />
            <link rel="canonical" href="https://studyspots.io/" />

            <meta property="og:title" content="Study Spots | Find Places to Study" />
            <meta
              property="og:description"
              content="Discover study-friendly cafes, libraries and workspaces near you."
            />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://studyspots.io/" />
          </Helmet>
         <Navbar
         session={session}
         language={language}
         setLanguage={setLanguage}
         isAdmin={isAdmin}
         />
         <BottomNav session={session} />

<section className="hero-section">
  <div className="hero-text">
    <h1>Find the perfect place to focus.</h1>
    <p>
      Discover study-friendly cafes, libraries, and workspaces in Linz,
      Vienna and Istanbul.
    </p>
  </div>
</section>

<FilterSection
  searchText={searchText}
  setSearchText={setSearchText}

  selectedCity={selectedCity}
  setSelectedCity={setSelectedCity}

  categoryOptions={categoryOptions}
  selectedCategory={selectedCategory}
  setSelectedCategory={setSelectedCategory}

  sortOption={sortOption}
  setSortOption={setSortOption}

  selectedFeatures={selectedFeatures}
  setSelectedFeatures={setSelectedFeatures}
  selectedRating={selectedRating}
  setSelectedRating={setSelectedRating}
/>

<section className="map-preview-section">
  <div className="top-places-panel">
    <div className="top-places-header">
      <h2>
        {sortedPlaces.length} {t.placesFound}
      </h2>
      <p>{t.topPlaces}</p>
    </div>

    <div className="top-places-list">
      {sortedPlaces.slice(0, 4).map((place) => (
        <Link
          to={`/places/${place.slug || place.id}`}
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
      places={sortedPlaces}
      onSelectPlace={setSelectedPlace}
    />
  </div>
</section>
<section className="add-spot-section">
  <div className="add-spot-content">
    <div>
      <h2>Know a great study place?</h2>
      <p>
        Help other students find quiet cafes, libraries, and study-friendly spots.
      </p>
    </div>

    <Link to="/add-spot" className="add-spot-button">
      Add a Spot
    </Link>
  </div>
</section>

            <PlaceList places={sortedPlaces} />
          </div>
        }
      />

      <Route path="/login" element={<LoginPage session={session} />} />
      <Route path="/places/:slug" element={<PlacePage session={session} isAdmin={isAdmin} />}/>
      <Route path="/places/:slug/edit" element={<EditPlacePage session={session} isAdmin={isAdmin} />}/>
      <Route path="/profile" element={<ProfilePage session={session} />} />
      <Route path="/add-spot" element={<AddSpotPage session={session} />} />
      <Route path="/import-osm" element={<ImportOsmPage session={session} />} />
      <Route path="/saved-places" element={<SavedPlacesPage session={session} />}/>
      <Route path="/users/:username" element={<UserProfilePage session={session} />} />  
      <Route path="/friends" element={<FriendsPage session={session} />}/>
      <Route path="/timer" element={<TimerPage session={session} />} />
    </Routes>
  </BrowserRouter>
  
);
}

export default App;