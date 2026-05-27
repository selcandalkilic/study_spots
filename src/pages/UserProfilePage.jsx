import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./UserProfilePage.css";

function UserProfilePage({ session }) {
  const { username } = useParams();

  const [profile, setProfile] = useState(null);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [addedPlacesCount, setAddedPlacesCount] = useState(0);
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0);

  const [loading, setLoading] = useState(true);
  const [friendRequest, setFriendRequest] = useState(null);
  const [friendLoading, setFriendLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (profileError) {
        console.log("Error fetching profile:", profileError);
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      if (session?.user?.id && session.user.id !== profileData.id) {
        const { data: requestData, error: requestError } = await supabase
          .from("friend_requests")
          .select("*")
          .or(
            `and(sender_id.eq.${session.user.id},receiver_id.eq.${profileData.id}),and(sender_id.eq.${profileData.id},receiver_id.eq.${session.user.id})`
          )
          .maybeSingle();

        if (requestError) {
          console.log("Error checking friend request:", requestError);
        } else {
          setFriendRequest(requestData);
        }
      }

      const { count: reviewCount, error: reviewError } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profileData.id);

      if (reviewError) {
        console.log("Error counting reviews:", reviewError);
      }

      setReviewsCount(reviewCount || 0);

      const { count: savedPlacesCount, error: savedError } = await supabase
        .from("saved_places")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profileData.id);

      if (savedError) {
        console.log("Error counting saved places:", savedError);
      }

      setSavedCount(savedPlacesCount || 0);

      const { count: placesCount, error: placesError } = await supabase
        .from("places")
        .select("*", { count: "exact", head: true })
        .eq("created_by", profileData.id);

      if (placesError) {
        console.log("Error counting added places:", placesError);
      }

      setAddedPlacesCount(placesCount || 0);

      /*
        This part assumes you later have a table called study_sessions
        with:
        - user_id
        - duration_minutes

        If your timer table has another name, only change this query.
      */
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("study_sessions")
        .select("duration_seconds")
        .eq("user_id", profileData.id);

      if (sessionsError) {
        console.log("Study sessions table not ready yet:", sessionsError.message);
        setTotalStudyMinutes(0);
      } else {
        const totalSeconds = (sessionsData || []).reduce(
          (total, sessionItem) =>
            total + Number(sessionItem.duration_seconds || 0),
          0
        );

        setTotalStudyMinutes(Math.floor(totalSeconds / 60));
      }

      setLoading(false);
    }

    fetchProfile();
  }, [username, session?.user?.id]);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <p>User not found.</p>
        <Link to="/">Back to homepage</Link>
      </div>
    );
  }

  const isOwnProfile = session?.user?.id === profile.id;

  const totalStudyHours = Math.floor(totalStudyMinutes / 60);
  const remainingMinutes = totalStudyMinutes % 60;

  const studyStars = Math.floor(totalStudyMinutes / 60);
  const addedPlaceStars = addedPlacesCount * 3;
  const reviewStars = reviewsCount;
  const totalStars = addedPlaceStars + studyStars + reviewStars;

  const level = Math.floor(totalStars / 5);
  const starsInsideCurrentLevel = totalStars % 5;
  const progressPercent = (starsInsideCurrentLevel / 5) * 100;
  const nextLevel = level + 1;
  const starsToNextLevel = 5 - starsInsideCurrentLevel;

  const visibleStars = Array.from({ length: 10 }, (_, index) => {
    return index < starsInsideCurrentLevel ? "filled" : "empty";
  });

  async function sendFriendRequest() {
    if (!session?.user) {
      alert("Please log in to add friends.");
      return;
    }

    if (!profile?.id) return;

    setFriendLoading(true);

    const { data, error } = await supabase
      .from("friend_requests")
      .insert({
        sender_id: session.user.id,
        receiver_id: profile.id,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.log("Error sending friend request:", error);
      alert("Could not send friend request.");
    } else {
      setFriendRequest(data);
    }

    setFriendLoading(false);
  }

  return (
    <div className="profile-page profile-dashboard-page">
      <Link to="/" className="profile-back-link">
        ← Back to homepage
      </Link>

      <section className="profile-hero-card profile-dashboard-hero">
        <div className="profile-avatar-large">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username || "Profile"} />
          ) : (
            <span>
              {(profile.username || profile.email || "U")[0].toUpperCase()}
            </span>
          )}
        </div>

        <div className="profile-main-info">
          <h1>{profile.username || "Unnamed user"}</h1>
          <p className="profile-location-line">
            📍 {profile.city || "No city added yet"}
          </p>
          <p>{profile.bio || "No bio added yet."}</p>

          {isOwnProfile ? (
            <Link to="/profile" className="profile-action-button">
              ✎ Edit my profile
            </Link>
          ) : (
            <button
              type="button"
              className="profile-action-button"
              onClick={sendFriendRequest}
              disabled={friendLoading || friendRequest?.status === "pending"}
            >
              {friendLoading
                ? "Sending..."
                : friendRequest?.status === "pending"
                ? "Request sent"
                : friendRequest?.status === "accepted"
                ? "Friends"
                : "Add friend"}
            </button>
          )}
        </div>

        <div className="profile-level-card">
          <div>
            <h2>Level {level}</h2>
            <p>⭐ Explorer</p>
          </div>

          <div className="profile-level-badge">{level}</div>

          <div className="profile-level-progress">
            <div
              className="profile-level-progress-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <small>
            {starsInsideCurrentLevel} / 5 stars to Level {nextLevel}
          </small>
        </div>
      </section>

      <section className="profile-stars-card">
        <div className="profile-section-title-row">
          <h2>Your Stars</h2>
          <p>
            <strong>{totalStars}</strong> Total Stars
          </p>
        </div>

        <div className="profile-star-strip" aria-label="Level progress stars">
          {visibleStars.map((star, index) => (
            <span
              key={index}
              className={
                star === "filled"
                  ? "profile-progress-star filled"
                  : "profile-progress-star"
              }
            >
              ★
            </span>
          ))}
        </div>

        <div className="profile-star-rules">
          <div>
            <strong>3★</strong>
            <span>per added place</span>
          </div>

          <div>
            <strong>1★</strong>
            <span>per study hour</span>
          </div>

          <div>
            <strong>1★</strong>
            <span>per review</span>
          </div>

          <div>
            <strong>5★</strong>
            <span>= 1 level</span>
          </div>
        </div>

        {starsInsideCurrentLevel === 0 && totalStars > 0 ? (
          <p className="profile-next-level-text">
            Nice! You just reached Level {level}.
          </p>
        ) : (
          <p className="profile-next-level-text">
            {starsToNextLevel} more stars until Level {nextLevel}.
          </p>
        )}
      </section>

      <section className="profile-dashboard-section">
        <h2>Your Statistics</h2>

        <div className="profile-stats-grid dashboard-stats-grid">
          <div className="profile-stat-card">
            <span className="profile-stat-icon">⏱</span>
            <strong>
              {totalStudyHours}.{Math.floor(remainingMinutes / 6)} h
            </strong>
            <span>Total study time</span>
            <p>
              {totalStudyHours} hours and {remainingMinutes} minutes
            </p>
          </div>

          <div className="profile-stat-card">
            <span className="profile-stat-icon">📍</span>
            <strong>{addedPlacesCount}</strong>
            <span>Added places</span>
            <p>{addedPlaceStars} stars earned from places</p>
          </div>

          <div className="profile-stat-card">
            <span className="profile-stat-icon">✎</span>
            <strong>{reviewsCount}</strong>
            <span>Reviews written</span>
            <p>{reviewStars} stars earned from reviews</p>
          </div>

          <div className="profile-stat-card">
            <span className="profile-stat-icon">♡</span>
            <strong>{savedCount}</strong>
            <span>Saved places</span>
            <p>Favorite study spots saved</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default UserProfilePage;