import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";
import "../admin.css";

function ImportOsmPage({ session }) {
  const [city, setCity] = useState("Linz");
  const [country, setCountry] = useState("Austria");
  const [category, setCategory] = useState("Library");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [pendingPlaces, setPendingPlaces] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  useEffect(() => {
  async function checkAdmin() {
    if (!session) {
      setCheckingAdmin(false);
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

    setCheckingAdmin(false);
  }

  checkAdmin();
}, [session]);
  useEffect(() => {
  if (isAdmin) {
    fetchPendingPlaces();
  }
}, [isAdmin]);

async function fetchPendingPlaces() {
  setPendingLoading(true);

  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Error fetching pending places:", error);
  } else {
    setPendingPlaces(data || []);
  }

  setPendingLoading(false);
}

async function approvePlace(placeId) {
  const { error } = await supabase
    .from("places")
    .update({ status: "approved" })
    .eq("id", placeId);

  if (error) {
    alert(error.message);
    console.log("Approve error:", error);
    return;
  }

  alert("Place approved!");
  fetchPendingPlaces();
}

async function rejectPlace(placeId) {
  const confirmReject = window.confirm(
    "Reject this place? It will not appear publicly."
  );

  if (!confirmReject) return;

  const { error } = await supabase
    .from("places")
    .update({ status: "rejected" })
    .eq("id", placeId);

  if (error) {
    alert(error.message);
    console.log("Reject error:", error);
    return;
  }

  alert("Place rejected.");
  fetchPendingPlaces();
}

  async function searchOsm() {
    setLoading(true);
    setResults([]);

    const query = encodeURIComponent(`${category} in ${city}, ${country}`);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=10`
    );

    const data = await response.json();

    setResults(data);
    setLoading(false);
  }

  async function importPlace(result) {
    if (!session) {
      alert("Please log in first.");
      return;
    }

    setImportingId(result.place_id);

    const { error } = await supabase.from("places").insert([
      {
        name: result.name || result.display_name.split(",")[0],
        city: city,
        country: country,
        category: category,
        description: `Imported from OpenStreetMap. Please verify study details.`,
        address: result.display_name,
        latitude: Number(result.lat),
        longitude: Number(result.lon),
        image_url: "",
        wifi: false,
        quiet: false,
        opening_hours: "",
        study_rating: null,
        wifi_quality: "",
        outlets: "",
        noise_level: "",
        seating: "",
        laptop_friendly: false,
        solo_study: true,
        group_study: false,
        best_time_to_study: "",
        crowded_times: "",
        source: "osm",
        external_id: String(result.place_id),
        needs_verification: true,
        created_by: session.user.id,
        status: "approved",
      },
    ]);

    setImportingId(null);

    if (error) {
      alert(error.message);
      console.log("Import error:", error);
    } else {
      alert("Place imported!");
    }
  }
        if (checkingAdmin) {
        return <p>Checking admin access...</p>;
        }

        if (!session || !isAdmin) {
        return (
            <div className="admin-page">
            <div className="admin-shell">
                <h1>Admin access only</h1>
                <p>You do not have permission to view this page.</p>
                <Link to="/" className="admin-back-link">
                ← Back to homepage
                </Link>
            </div>
            </div>
        );
        }
  return (
    <div className="import-page">
      <div className="import-card">
       
       <div className="admin-topbar">
  <Link to="/" className="admin-back-link">
    ← Back to homepage
  </Link>

  <span className="admin-pill">Admin only</span>
</div>

<h1>Admin Dashboard</h1>
<p>
  Import places from OpenStreetMap, review imported data, and manage study spot content.
</p>

<section className="admin-section">
  <div className="admin-section-header">
    <div>
      <h2>Pending user submissions</h2>
      <p>Review places added by users before they become public.</p>
    </div>

    <button type="button" onClick={fetchPendingPlaces}>
      Refresh
    </button>
  </div>

  {pendingLoading ? (
    <p>Loading pending places...</p>
  ) : pendingPlaces.length === 0 ? (
    <p className="admin-empty-text">No pending places right now.</p>
  ) : (
    <div className="pending-places-list">
      {pendingPlaces.map((place) => (
        <div className="pending-place-card" key={place.id}>
          <div>
            <h3>{place.name}</h3>

            <p>
              <strong>Category:</strong> {place.category || "No category"}
            </p>

            <p>
              <strong>Location:</strong> {place.city}, {place.country}
            </p>

            <p>
              <strong>Address:</strong> {place.address || "No address"}
            </p>

            <p>
              <strong>Description:</strong>{" "}
              {place.description || "No description"}
            </p>

            <small>
              Slug: {place.slug || "No slug"} · Status: {place.status}
            </small>
          </div>

          {place.image_url && (
            <img
              className="pending-place-image"
              src={place.image_url}
              alt={place.name}
            />
          )}

          <div className="pending-place-actions">
            <button
              type="button"
              onClick={() => approvePlace(place.id)}
            >
              Approve
            </button>

            <button
              type="button"
              className="reject-button"
              onClick={() => rejectPlace(place.id)}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</section>


        {!session && (
          <p className="import-warning">
            You need to log in before importing places.
          </p>
        )}

        <div className="import-form">
         <label>City</label>
          <select
            value={city}
            onChange={(event) => {
              const selectedCity = event.target.value;
              setCity(selectedCity);

              if (selectedCity === "Linz" || selectedCity === "Vienna") {
                setCountry("Austria");
              }

              if (selectedCity === "Istanbul") {
                setCountry("Turkey");
              }
            }}
          >
            <option value="Linz">Linz</option>
            <option value="Vienna">Vienna</option>
            <option value="Istanbul">Istanbul</option>
          </select>

          <label>Country</label>
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
          >
            <option value="Austria">Austria</option>
            <option value="Turkey">Turkey</option>
          </select>

          <label>Category</label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option>Library</option>
            <option>University</option>
            <option>Cafe</option>
            <option>Other</option>
          </select>

          <button type="button" onClick={searchOsm}>
            {loading ? "Searching..." : "Search OSM"}
          </button>
        </div>

        <div className="import-results">
          {results.map((result) => (
            <div className="import-result-card" key={result.place_id}>
              <h3>{result.name || result.display_name.split(",")[0]}</h3>
              <p>{result.display_name}</p>
              <small>
                lat: {result.lat}, lon: {result.lon}
              </small>

              <button
                type="button"
                onClick={() => importPlace(result)}
                disabled={importingId === result.place_id}
              >
                {importingId === result.place_id ? "Importing..." : "Import"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ImportOsmPage;