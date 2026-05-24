import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useState, useEffect } from "react";
import logo from "../assets/study-spots-logo.png";

function Navbar({ session, language, setLanguage, isAdmin }) {
  const [profile, setProfile] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!session) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", session.user.id)
        .single();

      if (!error) {
        setProfile(data);
      }
    }

    fetchProfile();
  }, [session]);
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="Study Spots" className="navbar-logo-img" />
      </Link>
      <>
</>

      <div className="navbar-links">

        <select
          className="navbar-select"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
        >
          <option value="EN">EN</option>
          <option value="DE">DE</option>
          <option value="TR">TR</option>
        </select>

       {session ? (
  <>
    {isAdmin && (
      <Link to="/import-osm" className="navbar-admin-link">
        Admin
      </Link>
    )}

    <div className="navbar-user-menu">
      <button
        type="button"
        className="navbar-avatar-button"
        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt={profile?.username || "Profile"} />
        ) : (
          <span>
            {profile?.username
              ? profile.username[0].toUpperCase()
              : session.user.email[0].toUpperCase()}
          </span>
        )}
      </button>

              {profileMenuOpen && (
                <div className="navbar-dropdown">
                 <Link to="/profile" onClick={() => setProfileMenuOpen(false)}>
                      My Profile
                    </Link>

                    <Link to="/saved-places" onClick={() => setProfileMenuOpen(false)}>
                      Saved places
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        supabase.auth.signOut();
                      }}
                    >
                      Log out
                    </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="navbar-login-button">
            Log in
          </Link>
)}
      </div>
    </nav>
  );
}

export default Navbar;