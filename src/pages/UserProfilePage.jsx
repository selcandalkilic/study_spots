import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./UserProfilePage.css";

function UserProfilePage({ session }) {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
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

      const { count: reviewCount } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profileData.id);

      setReviewsCount(reviewCount || 0);

      const { count: savedPlacesCount } = await supabase
        .from("saved_places")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profileData.id);

      setSavedCount(savedPlacesCount || 0);

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
    <div className="profile-page">
      <Link to="/" className="profile-back-link">
        ← Back to homepage
      </Link>

      <section className="profile-hero-card">
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
          <p>{profile.city || "No city added yet"}</p>
          <p>{profile.bio || "No bio added yet."}</p>

          {isOwnProfile ? (
            <Link to="/profile" className="profile-action-button">
              Edit my profile
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
      </section>

      <section className="profile-stats-grid">
        <div className="profile-stat-card">
          <strong>{reviewsCount}</strong>
          <span>Reviews</span>
        </div>

        <div className="profile-stat-card">
          <strong>{savedCount}</strong>
          <span>Saved places</span>
        </div>
      </section>
    </div>
  );
}

export default UserProfilePage;