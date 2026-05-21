import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Navbar({ searchText, setSearchText, session }) {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        📍 Study Spots
      </Link>

      <div className="navbar-search">
        <input
          type="text"
          placeholder="Search cafes, libraries, cities..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </div>

      <div className="navbar-links">
        <button className="navbar-link-button">Add a Spot</button>

        <select className="navbar-select">
          <option>EN</option>
          <option>DE</option>
          <option>TR</option>
        </select>

        {session ? (
          <>
            <span className="navbar-user">{session.user.email}</span>
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