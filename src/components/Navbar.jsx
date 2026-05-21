import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useState } from "react";

function Navbar({ searchText, setSearchText, session, language, setLanguage }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        📍 Study Spots
      </Link>
      <>
  <div className="navbar-search desktop-search">
    <input
      type="text"
      placeholder="Search cafes, libraries, cities..."
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
    />
  </div>

  <button
    className="mobile-search-button"
    onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
    type="button"
  >
    🔍
  </button>
  {mobileSearchOpen && (
  <div className="mobile-search-row">
    <input
      type="text"
      placeholder="Search cafes, libraries, cities..."
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
    />
  </div>
)}
</>

      <div className="navbar-links">
        <Link to="/add-spot" className="navbar-add-link">
          Add a Spot
        </Link>

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
            <Link to="/profile" className="navbar-profile-link">
              My Profile
            </Link>

            <button
              className="navbar-link-button"
              onClick={() => supabase.auth.signOut()}
            >
              Log out
            </button>
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