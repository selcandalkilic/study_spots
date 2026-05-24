import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

function SavedPlacesPage({ session }) {
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSavedPlaces() {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("saved_places")
        .select(`
          id,
          place_id,
          places (*)
        `)
        .eq("user_id", session.user.id);

      if (error) {
        console.log("Error fetching saved places:", error);
      } else {
        setSavedPlaces(data || []);
      }

      setLoading(false);
    }

    fetchSavedPlaces();
  }, [session]);

  if (loading) return <p>Loading saved places...</p>;

  if (!session?.user) {
    return <p>Please log in to see your saved places.</p>;
  }

  return (
    <div className="page-container">
      <h1>Saved places</h1>

      {savedPlaces.length === 0 ? (
        <p>You have not saved any places yet.</p>
      ) : (
        <div className="places-grid">
          {savedPlaces.map((saved) => (
            <Link
              key={saved.id}
              to={`/places/${saved.places.slug}`}
              className="place-card"
            >
              <h2>{saved.places.name}</h2>
              <p>
                {saved.places.city}, {saved.places.country}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedPlacesPage;