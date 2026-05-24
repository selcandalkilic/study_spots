import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import PlaceDetails from "../components/PlaceDetails";

function PlacePage({ session }) {
  const { slug } = useParams();
  const [place, setPlace] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlace() {
      const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("slug", slug)
    .single();

      if (error) {
        console.log("Error fetching place:", error);
      } else {
        setPlace(data);
      }
      const { data: allPlaces, error: allPlacesError } = await supabase
      .from("places")
      .select("*");
      if (!allPlacesError) {
        setPlaces(allPlaces || []);
      }
      setLoading(false);
    }

    fetchPlace();
  }, [slug]);

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
        place={place} places={places}
        onClose={() => {}}
        session={session}
      />
    </div>
  );
}

export default PlacePage;