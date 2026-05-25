import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

function createSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function EditPlacePage({ session, isAdmin }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    city: "",
    country: "",
    category: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    image_url: "",
    image_credit: "",
    opening_hours: "",
  });

  const [placeId, setPlaceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchPlace() {
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        console.log("Edit place fetch error:", error);
        setLoading(false);
        return;
      }

      setPlaceId(data.id);

      setForm({
        name: data.name || "",
        slug: data.slug || "",
        city: data.city || "",
        country: data.country || "",
        category: data.category || "",
        description: data.description || "",
        address: data.address || "",
        latitude: data.latitude || "",
        longitude: data.longitude || "",
        image_url: data.image_url || "",
        image_credit: data.image_credit || "",
        opening_hours: data.opening_hours || "",
      });

      setLoading(false);
    }

    fetchPlace();
  }, [slug]);

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function savePlace(event) {
    event.preventDefault();

    if (!session || !isAdmin) {
      alert("Admin access only.");
      return;
    }

    if (!form.name || !form.city || !form.country) {
      alert("Name, city and country are required.");
      return;
    }

    setSaving(true);

    const newSlug = form.slug || createSlug(form.name);

    const { error } = await supabase
      .from("places")
      .update({
        name: form.name,
        slug: newSlug,
        city: form.city,
        country: form.country,
        category: form.category,
        description: form.description,
        address: form.address,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        image_url: form.image_url,
        image_credit: form.image_credit,
        opening_hours: form.opening_hours,
      })
      .eq("id", placeId);

    setSaving(false);

    if (error) {
      alert(error.message);
      console.log("Edit place save error:", error);
      return;
    }

    alert("Place updated!");
    navigate(`/places/${newSlug}`);
  }

  if (loading) {
    return <p>Loading place editor...</p>;
  }

  if (!session || !isAdmin) {
    return (
      <div className="add-spot-page">
        <div className="add-spot-card">
          <h1>Admin access only</h1>
          <p>You do not have permission to edit places.</p>
          <Link to="/" className="back-home-link">
            ← Back to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="add-spot-page">
      <div className="add-spot-card">
        <Link to={`/places/${slug}`} className="back-home-link">
          ← Back to place
        </Link>

        <h1>Edit Place</h1>
        <p>Update place information, image, address, and photo credit.</p>

        <form className="add-spot-form" onSubmit={savePlace}>
          <label>Place name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />

          <label>Slug</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            placeholder="example: jku-library"
          />

          <div className="form-two-columns">
            <div>
              <label>City *</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
            </div>

            <div>
              <label>Country *</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
              />
            </div>
          </div>

          <label>Category</label>
          <select
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
          >
            <option>Cafe</option>
            <option>Library</option>
            <option>University</option>
            <option>Other</option>
          </select>

          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />

          <label>Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
          />

          <div className="form-two-columns">
            <div>
              <label>Latitude</label>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => updateField("latitude", e.target.value)}
              />
            </div>

            <div>
              <label>Longitude</label>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => updateField("longitude", e.target.value)}
              />
            </div>
          </div>

          <label>Image URL</label>
          <input
            type="text"
            value={form.image_url}
            onChange={(e) => updateField("image_url", e.target.value)}
          />

          <label>Photo credit</label>
          <input
            type="text"
            value={form.image_credit}
            onChange={(e) => updateField("image_credit", e.target.value)}
            placeholder="Example: Own photo, Photo by Selcan, Unsplash / Name"
          />

          <label>Opening hours</label>
          <input
            type="text"
            value={form.opening_hours}
            onChange={(e) => updateField("opening_hours", e.target.value)}
            placeholder="Example: Monday-Friday 09:00-18:00"
          />

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditPlacePage;