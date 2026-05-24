import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./FriendsPage.css";

function FriendsPage({ session }) {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  useEffect(() => {
    fetchFriendData();
  }, [session?.user?.id]);

async function fetchFriendData() {
  if (!session?.user?.id) {
    setLoading(false);
    return;
  }

  setLoading(true);

  const userId = session.user.id;

  const { data: requestsData, error: requestsError } = await supabase
    .from("friend_requests")
    .select("*")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

  if (requestsError) {
    console.log("Error fetching friend requests:", requestsError);
    setLoading(false);
    return;
  }

  const requests = requestsData || [];

  const profileIds = [
    ...new Set(
      requests
        .flatMap((request) => [request.sender_id, request.receiver_id])
        .filter((id) => id && id !== userId)
    ),
  ];

  let profilesById = {};

  if (profileIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, city")
      .in("id", profileIds);

    if (profilesError) {
      console.log("Error fetching friend profiles:", profilesError);
    } else {
      profilesById = (profilesData || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {});
    }
  }

  const incoming = requests
    .filter(
      (request) =>
        request.receiver_id === userId && request.status === "pending"
    )
    .map((request) => ({
      ...request,
      sender: profilesById[request.sender_id],
    }))
    .filter((request) => request.sender);

  const outgoing = requests
    .filter(
      (request) =>
        request.sender_id === userId && request.status === "pending"
    )
    .map((request) => ({
      ...request,
      receiver: profilesById[request.receiver_id],
    }))
    .filter((request) => request.receiver);

  const acceptedFriends = requests
    .filter((request) => request.status === "accepted")
    .map((request) => {
      const friendId =
        request.sender_id === userId ? request.receiver_id : request.sender_id;

      return profilesById[friendId];
    })
    .filter(Boolean);

  setIncomingRequests(incoming);
  setOutgoingRequests(outgoing);
  setFriends(acceptedFriends);
  setLoading(false);
}

  async function searchUsers(value) {
    setSearchText(value);

    if (!session?.user?.id) return;

    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, city")
      .ilike("username", `%${value.trim()}%`)
      .neq("id", session.user.id)
      .limit(10);

    if (error) {
      console.log("Error searching users:", error);
    } else {
      setSearchResults(data || []);
    }
  }

  async function sendFriendRequest(receiverId) {
    if (!session?.user?.id) return;

    const { data: existingRequest, error: existingError } = await supabase
  .from("friend_requests")
  .select("*")
  .or(
  `and(sender_id.eq.${session.user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${session.user.id})`
)
  .maybeSingle();

if (existingError) {
  console.error(existingError);
  alert("Could not check existing friend request.");
  return;
}

if (existingRequest) {
  alert("A friend request or friendship already exists with this user.");
  return;
}

    const { error } = await supabase.from("friend_requests").insert({
      sender_id: session.user.id,
      receiver_id: receiverId,
      status: "pending",
    });

    if (error) {
      console.log("Error sending friend request:", error);
      alert("Could not send friend request. Maybe you already sent one.");
      return;
    }

    alert("Friend request sent.");
    setSearchResults([]);
    setSearchText("");
    fetchFriendData();
  }

  async function acceptRequest(requestId) {
    const { error } = await supabase
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (error) {
      console.log("Error accepting request:", error);
      alert("Could not accept request.");
      return;
    }

    fetchFriendData();
  }

  async function declineRequest(requestId) {
    const { error } = await supabase
      .from("friend_requests")
      .update({ status: "declined" })
      .eq("id", requestId);

    if (error) {
      console.log("Error declining request:", error);
      alert("Could not decline request.");
      return;
    }

    fetchFriendData();
  }

  if (!session?.user) {
    return (
      <div className="friends-page">
        <h1>Friends</h1>
        <p>Please log in to use friends.</p>
      </div>
    );
  }

  if (loading) {
    return <p className="friends-loading">Loading friends...</p>;
  }

  return (
  <div className="friends-page">
    <Link to="/" className="friends-back-link">
      ← Back to homepage
    </Link>

    <h1>Friends</h1>
    <p className="friends-subtitle">
      Search users, send friend requests, and later start study chats.
    </p>

    <section className="friends-card">
      <h2>Find people</h2>

      <input
        className="friends-search-input"
        type="text"
        placeholder="Search username..."
        value={searchText}
        onChange={(e) => searchUsers(e.target.value)}
      />

      {searchResults.length > 0 && (
        <div className="friends-results">
          {searchResults.map((user) => (
            <div key={user.id} className="friends-user-row">
              <Link to={`/users/${user.username}`} className="friends-user-info">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} />
                ) : (
                  <div className="friends-avatar-placeholder">
                    {user.username?.[0]?.toUpperCase() || "U"}
                  </div>
                )}

                <div>
                  <strong>{user.username}</strong>
                  <span>{user.city || "No city"}</span>
                </div>
              </Link>

              <button type="button" onClick={() => sendFriendRequest(user.id)}>
                Add
              </button>
            </div>
          ))}
        </div>
      )}
    </section>

    <section className="friends-card">
      <h2>Friend requests</h2>

      {incomingRequests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        incomingRequests.map((request) => (
          <div key={request.id} className="friends-user-row">
            <Link
              to={`/users/${request.sender.username}`}
              className="friends-user-info"
            >
              {request.sender.avatar_url ? (
                <img
                  src={request.sender.avatar_url}
                  alt={request.sender.username}
                />
              ) : (
                <div className="friends-avatar-placeholder">
                  {request.sender.username?.[0]?.toUpperCase() || "U"}
                </div>
              )}

              <div>
                <strong>{request.sender.username}</strong>
                <span>{request.sender.city || "No city"}</span>
              </div>
            </Link>

            <div className="friends-actions">
              <button type="button" onClick={() => acceptRequest(request.id)}>
                Accept
              </button>
              <button type="button" onClick={() => declineRequest(request.id)}>
                Decline
              </button>
            </div>
          </div>
        ))
      )}
    </section>

    <section className="friends-card">
      <h2>Sent requests</h2>

      {outgoingRequests.length === 0 ? (
        <p>No sent requests.</p>
      ) : (
        outgoingRequests.map((request) => (
          <div key={request.id} className="friends-user-row">
            <Link
              to={`/users/${request.receiver.username}`}
              className="friends-user-info"
            >
              {request.receiver.avatar_url ? (
                <img
                  src={request.receiver.avatar_url}
                  alt={request.receiver.username}
                />
              ) : (
                <div className="friends-avatar-placeholder">
                  {request.receiver.username?.[0]?.toUpperCase() || "U"}
                </div>
              )}

              <div>
                <strong>{request.receiver.username}</strong>
                <span>{request.receiver.city || "No city"}</span>
              </div>
            </Link>

            <button type="button" disabled>
              Pending
            </button>
          </div>
        ))
      )}
    </section>

    <section className="friends-card">
      <h2>My friends</h2>

      {friends.length === 0 ? (
        <p>No friends yet.</p>
      ) : (
        friends.map((friend) => (
          <div key={friend.id} className="friends-user-row">
            <Link to={`/users/${friend.username}`} className="friends-user-info">
              {friend.avatar_url ? (
                <img src={friend.avatar_url} alt={friend.username} />
              ) : (
                <div className="friends-avatar-placeholder">
                  {friend.username?.[0]?.toUpperCase() || "U"}
                </div>
              )}

              <div>
                <strong>{friend.username}</strong>
                <span>{friend.city || "No city"}</span>
              </div>
            </Link>

            <button type="button" disabled>
              Chat soon
            </button>
          </div>
        ))
      )}
    </section>
  </div>
);
}

export default FriendsPage;