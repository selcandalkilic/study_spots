import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import PlaceDetails from "../components/PlaceDetails";

function PlacePage({ session }) {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlace() {
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.log("Error fetching place:", error);
      } else {
        setPlace(data);
      }

      setLoading(false);
    }

    fetchPlace();
  }, [id]);

  if (loading) {
    return <p>Loading place...</p>;
  }

  if (!place) {
    return (
      <div>
        <p>Place not found.</p>
        <Link to="/">Back to homepage</Link>
      </div>
    );
  }

  return (
    <div className="place-page">
      <Link to="/" className="back-home-link">
        ← Back to all places
      </Link>

      <PlaceDetails
        place={place}
        onClose={() => {}}
        session={session}
      />
    </div>
  );
}

export default PlacePage;