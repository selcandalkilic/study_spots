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

    const { data: incomingData, error: incomingError } = await supabase
      .from("friend_requests")
      .select(`
        id,
        sender_id,
        receiver_id,
        status,
        created_at,
        sender:profiles!friend_requests_sender_id_fkey (
          id,
          username,
          avatar_url,
          city
        )
      `)
      .eq("receiver_id", session.user.id)
      .eq("status", "pending");

    if (incomingError) {
      console.log("Error fetching incoming requests:", incomingError);
    } else {
      setIncomingRequests(incomingData || []);
    }

    const { data: outgoingData, error: outgoingError } = await supabase
  .from("friend_requests")
  .select(`
    id,
    sender_id,
    receiver_id,
    status,
    created_at,
    receiver:profiles!friend_requests_receiver_id_fkey (
      id,
      username,
      avatar_url,
      city
    )
  `)
  .eq("sender_id", session.user.id)
  .eq("status", "pending");

if (outgoingError) {
  console.log("Error fetching outgoing requests:", outgoingError);
} else {
  setOutgoingRequests(outgoingData || []);
}

    const { data: friendData, error: friendError } = await supabase
      .from("friend_requests")
      .select(`
        id,
        sender_id,
        receiver_id,
        status,
        sender:profiles!friend_requests_sender_id_fkey (
          id,
          username,
          avatar_url,
          city
        ),
        receiver:profiles!friend_requests_receiver_id_fkey (
          id,
          username,
          avatar_url,
          city
        )
      `)
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .eq("status", "accepted");

    if (friendError) {
      console.log("Error fetching friends:", friendError);
    } else {
      const mappedFriends = (friendData || []).map((request) => {
        return request.sender_id === session.user.id
          ? request.receiver
          : request.sender;
      });

      setFriends(mappedFriends);
    }

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

                <button
                  type="button"
                  onClick={() => sendFriendRequest(user.id)}
                >
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
                  <img src={request.sender.avatar_url} alt={request.sender.username} />
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