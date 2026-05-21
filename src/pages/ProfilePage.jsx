import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

function ProfilePage({ session }) {
  const [profile, setProfile] = useState({
    username: "",
    full_name: "",
    bio: "",
    city: "",
    avatar_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.log("Profile fetch error:", error);
      } else if (data) {
        setProfile({
          username: data.username || "",
          full_name: data.full_name || "",
          bio: data.bio || "",
          city: data.city || "",
          avatar_url: data.avatar_url || "",
        });
      }

      setLoading(false);
    }

    fetchProfile();
  }, [session]);

  async function saveProfile(event) {
    event.preventDefault();

    if (!session) {
      alert("Please log in first.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("profiles").upsert({
      id: session.user.id,
      username: profile.username,
      full_name: profile.full_name,
      bio: profile.bio,
      city: profile.city,
      avatar_url: profile.avatar_url,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Profile saved!");
    }
  }

  if (!session) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <h1>You are not logged in</h1>
          <p>Please log in to edit your profile.</p>
          <Link to="/login" className="navbar-login-button">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <Link to="/" className="back-home-link">
          ← Back to homepage
        </Link>

        <div className="profile-header">
          {profile.avatar_url ? (
            <img
              className="profile-avatar"
              src={profile.avatar_url}
              alt={profile.username}
            />
          ) : (
            <div className="profile-avatar-placeholder">
              {profile.username ? profile.username[0].toUpperCase() : "U"}
            </div>
          )}

          <div>
            <h1>{profile.username || "Your profile"}</h1>
            <p>{session.user.email}</p>
          </div>
        </div>

        <form className="profile-form" onSubmit={saveProfile}>
          <label>Username</label>
          <input
            type="text"
            placeholder="example: studyqueen"
            value={profile.username}
            onChange={(e) =>
              setProfile({ ...profile, username: e.target.value })
            }
          />

          <label>Full name</label>
          <input
            type="text"
            placeholder="Your name"
            value={profile.full_name}
            onChange={(e) =>
              setProfile({ ...profile, full_name: e.target.value })
            }
          />

          <label>City</label>
          <input
            type="text"
            placeholder="Linz, Vienna, Istanbul..."
            value={profile.city}
            onChange={(e) =>
              setProfile({ ...profile, city: e.target.value })
            }
          />

          <label>Profile picture URL</label>
          <input
            type="text"
            placeholder="Paste an image URL for now"
            value={profile.avatar_url}
            onChange={(e) =>
              setProfile({ ...profile, avatar_url: e.target.value })
            }
          />

          <label>Bio</label>
          <textarea
            placeholder="Tell people what kind of study spots you like..."
            value={profile.bio}
            onChange={(e) =>
              setProfile({ ...profile, bio: e.target.value })
            }
          />

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;