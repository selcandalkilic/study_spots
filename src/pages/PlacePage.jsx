import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import PlaceDetails from "../components/PlaceDetails";
import { Helmet } from "react-helmet-async";

function PlacePage({ session, isAdmin }) {
  const { slug } = useParams();
  const [place, setPlace] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlace() {
      setLoading(true);

      const { data, error } = await supabase
        .from("places")
        .select("*")
        .eq("slug", slug)
        .eq("status", "approved")
        .single();

      if (error) {
        console.log("Error fetching place:", error);
        setPlace(null);
      } else {
        setPlace(data);
      }

      const { data: allPlaces, error: allPlacesError } = await supabase
        .from("places")
        .select("*")
        .eq("status", "approved");

      if (!allPlacesError) {
        setPlaces(allPlaces || []);
      }

      setLoading(false);
    }

    fetchPlace();
  }, [slug]);

  useEffect(() => {
  if (place) {
    document.title = `${place.name} | Study Spot in ${place.city}`;
  }
}, [place]);

  if (loading) {
    return <p>Loading place...</p>;
  }

  if (!place) {
    return (
      <div>
        <Helmet>
          <title>Place not found | Study Spots</title>
        </Helmet>

        <p>Place not found.</p>
        <Link to="/">Back to homepage</Link>
      </div>
    );
  }

  const placeUrl = `https://studyspots.io/places/${place.slug}`;
  

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: place.name,
    description:
      place.description || `Study spot in ${place.city}, ${place.country}`,
    image: place.image_url || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: place.address || "",
      addressLocality: place.city || "",
      addressCountry: place.country || "",
    },
    geo:
      place.latitude && place.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: Number(place.latitude),
            longitude: Number(place.longitude),
          }
        : undefined,
    url: placeUrl,
    aggregateRating: place.study_rating
      ? {
          "@type": "AggregateRating",
          ratingValue: Number(place.study_rating),
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  };

  return (
    <div className="place-page">
      <Helmet>
        <title>{place.name} | Study Spot in {place.city}</title>

        <meta
          name="description"
          content={
            place.description
              ? place.description.slice(0, 155)
              : `Study at ${place.name} in ${place.city}, ${place.country}. See ratings for WiFi, outlets, quietness, seating and study-friendliness.`
          }
        />

        <link rel="canonical" href={placeUrl} />

        <meta property="og:title" content={`${place.name} | Study Spots`} />
        <meta
          property="og:description"
          content={
            place.description ||
            `Find study information, reviews and location for ${place.name}.`
          }
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={placeUrl} />

        {place.image_url && (
          <meta property="og:image" content={place.image_url} />
        )}

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <Link to="/" className="back-home-link">
        ← Back to all places
      </Link>

      {isAdmin && (
        <Link
          to={`/places/${place.slug}/edit`}
          className="admin-edit-place-button"
        >
          Edit place
        </Link>
      )}

      <PlaceDetails
        place={place}
        places={places}
        onClose={() => {}}
        session={session}
      />
    </div>
  );
}

export default PlacePage;