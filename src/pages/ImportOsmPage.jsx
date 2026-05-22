import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

function ImportOsmPage({ session }) {
  const [city, setCity] = useState("Linz");
  const [country, setCountry] = useState("Austria");
  const [category, setCategory] = useState("Library");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

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
        
        <Link to="/" className="back-home-link">
          ← Back to homepage
        </Link>

       <h1>Admin Dashboard</h1>
            <p>
            Import study spots from OpenStreetMap and manage imported data.
            </p>

        {!session && (
          <p className="import-warning">
            You need to log in before importing places.
          </p>
        )}

        <div className="import-form">
          <label>City</label>
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />

          <label>Country</label>
          <input
            value={country}
            onChange={(event) => setCountry(event.target.value)}
          />

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