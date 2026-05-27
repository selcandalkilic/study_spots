import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import StudyStats from "../components/StudyStats";

function ProfilePage({ session }) {
  const [profile, setProfile] = useState({
    username: "",
    full_name: "",
    bio: "",
    city: "",
    avatar_url: "",
    role: "",
    school_or_workplace: "",
    study_field: "",
    favorite_study_type: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [addedPlacesCount, setAddedPlacesCount] = useState(0);
  const [totalStudySeconds, setTotalStudySeconds] = useState(0);

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
          role: data.role || "",
          school_or_workplace: data.school_or_workplace || "",
          study_field: data.study_field || "",
          favorite_study_type: data.favorite_study_type || "",
        });
      }
      const { count: reviewCount } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      setReviewsCount(reviewCount || 0);

      const { count: placesCount } = await supabase
        .from("places")
        .select("*", { count: "exact", head: true })
        .eq("created_by", session.user.id);

      setAddedPlacesCount(placesCount || 0);

      const { data: sessionsData, error: sessionsError } = await supabase
        .from("study_sessions")
        .select("duration_seconds")
        .eq("user_id", session.user.id);

      if (sessionsError) {
        console.log("Study sessions fetch error:", sessionsError.message);
        setTotalStudySeconds(0);
      } else {
        const seconds = (sessionsData || []).reduce(
          (total, item) => total + Number(item.duration_seconds || 0),
          0
        );

        setTotalStudySeconds(seconds);
      }

      setLoading(false);
    }

    fetchProfile();
  }, [session]);

  async function uploadAvatar(event) {
    const file = event.target.files[0];

    if (!file || !session) {
      return;
    }

    setUploading(true);

    const fileExtension = file.name.split(".").pop();
    const filePath = `${session.user.id}/avatar.${fileExtension}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
      });

    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    setProfile({
      ...profile,
      avatar_url: data.publicUrl,
    });

    setUploading(false);
  }

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
      role: profile.role,
      school_or_workplace: profile.school_or_workplace,
      study_field: profile.study_field,
      favorite_study_type: profile.favorite_study_type,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Profile saved!");
      setEditing(false);
    }

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

  const totalStudyHours = Math.floor(totalStudySeconds / 3600);
  const totalStudyMinutes = Math.floor(totalStudySeconds / 60);
  const remainingMinutes = totalStudyMinutes % 60;

  const addedPlaceStars = addedPlacesCount * 3;
  const studyStars = totalStudyHours;
  const reviewStars = reviewsCount;

  const totalStars = addedPlaceStars + studyStars + reviewStars;
  const level = Math.floor(totalStars / 5);
  const starsInCurrentLevel = totalStars % 5;
  const nextLevel = level + 1;
  const progressPercent = (starsInCurrentLevel / 5) * 100;

  const starsToShow = Array.from({ length: 5 }, (_, index) =>
    index < starsInCurrentLevel ? "filled" : "empty"
  );

  return (
    <div className="profile-page">
      <div className="profile-card">
        <Link to="/" className="back-home-link">
          ← Back to homepage
        </Link>

        {!editing && (
  <>
    <div className="profile-overview-header">
      <div className="profile-overview-main">
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
          <p>📍 {profile.city || "No city added yet"}</p>
          <p>{profile.bio || "No bio added yet."}</p>
          <small>{session.user.email}</small>
        </div>
      </div>

      <button
        type="button"
        className="profile-edit-button"
        onClick={() => setEditing(true)}
      >
        ✎ Edit Profile
      </button>
    </div>

    <div className="profile-level-card">
      <div>
        <h2>Level {level}</h2>
        <p>⭐ Explorer</p>
      </div>

      <div className="profile-level-badge" aria-label={`Level ${level}`}>
        <svg className="profile-level-badge-svg" viewBox="0 0 80 96" role="img">
          <path
            d="M28 58 L22 92 L40 78 L58 92 L52 58 Z"
            className="badge-ribbon"
          />

          <circle cx="40" cy="36" r="30" className="badge-outer" />
          <circle cx="40" cy="36" r="22" className="badge-inner" />

          <text
            x="40"
            y="37"
            textAnchor="middle"
            dominantBaseline="middle"
            className="badge-number"
          >
            {level}
          </text>
        </svg>
      </div>

      <div className="profile-level-progress">
        <div
          className="profile-level-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <small>
        {starsInCurrentLevel} / 5 stars to Level {nextLevel}
      </small>
    </div>

    <div className="profile-stars-card">
      <div className="profile-stars-title">
        <h2>Your Stars ☆</h2>
        <p>
          <strong>{totalStars}</strong> Total Stars
        </p>
      </div>

      <div className="profile-star-strip">
        {starsToShow.map((star, index) => (
          <span
            key={index}
            className={star === "filled" ? "profile-star filled" : "profile-star"}
          >
            ★
          </span>
        ))}
      </div>

      <div className="profile-star-rules">
        <div>
          <strong>3★</strong>
          <span>3 stars per added place</span>
        </div>

        <div>
          <strong>1★</strong>
          <span>1 star per study hour</span>
        </div>

        <div>
          <strong>1★</strong>
          <span>1 star per review</span>
        </div>

        <div>
          <strong>5★</strong>
          <span>Every 5 stars = 1 level</span>
        </div>
      </div>
    </div>

    <section className="profile-dashboard-section">
      <h2>Your Statistics</h2>

      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <span className="profile-stat-icon">⏱</span>
          <strong>{totalStudyHours} h</strong>
          <span>Total Study Time</span>
          <p>
            {totalStudyHours} hours and {remainingMinutes} minutes
          </p>
        </div>

        <div className="profile-stat-card">
          <span className="profile-stat-icon">📍</span>
          <strong>{addedPlacesCount}</strong>
          <span>Added Places</span>
          <p>Keep discovering great spots ✨</p>
        </div>

        <div className="profile-stat-card">
          <span className="profile-stat-icon">✎</span>
          <strong>{reviewsCount}</strong>
          <span>Reviews Written</span>
          <p>Thanks for helping the community 💜</p>
        </div>
      </div>
    </section>
  </>
)}

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

        {editing && (
          <form className="profile-form" onSubmit={saveProfile}>
          <div className="profile-upload-box">
          <label className="profile-upload-label">Profile picture</label>

          <label className="profile-upload-button">
            Choose image
            <input type="file" accept="image/*" onChange={uploadAvatar} />
          </label>

          {uploading && <p className="profile-uploading-text">Uploading image...</p>}
        </div>

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

          <label>Role</label>
          <select
            value={profile.role}
            onChange={(e) =>
              setProfile({ ...profile, role: e.target.value })
            }
          >
            <option value="">Prefer not to say</option>
            <option value="Student">Student</option>
            <option value="Worker">Worker</option>
            <option value="Student worker">Student worker</option>
            <option value="Other">Other</option>
          </select>

          <label>School / University / Workplace</label>
          <input
            type="text"
            placeholder="Example: JKU, TU Wien, Istanbul University..."
            value={profile.school_or_workplace}
            onChange={(e) =>
              setProfile({
                ...profile,
                school_or_workplace: e.target.value,
              })
            }
          />

          <label>Study field or job area</label>
          <input
            type="text"
            placeholder="Example: Computer Science, Design, Medicine..."
            value={profile.study_field}
            onChange={(e) =>
              setProfile({ ...profile, study_field: e.target.value })
            }
          />

          <label>Favorite study type</label>
          <select
            value={profile.favorite_study_type}
            onChange={(e) =>
              setProfile({
                ...profile,
                favorite_study_type: e.target.value,
              })
            }
          >
            <option value="">Choose one</option>
            <option value="Quiet solo study">Quiet solo study</option>
            <option value="Group study">Group study</option>
            <option value="Cafe study">Cafe study</option>
            <option value="Library study">Library study</option>
            <option value="Late night study">Late night study</option>
          </select>

          <label>Bio</label>
          <textarea
            placeholder="Tell people what kind of study spots you like..."
            value={profile.bio}
            onChange={(e) =>
              setProfile({ ...profile, bio: e.target.value })
            }
          />

          <button type="submit">
            {saving ? "Saving..." : "Save profile"}
          </button>

          <button
            type="button"
            className="profile-cancel-button"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
        </form>
        )}
        <StudyStats session={session} />
      </div>
    </div>
  );
}

export default ProfilePage;