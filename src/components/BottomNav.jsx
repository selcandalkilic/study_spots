import { NavLink } from "react-router-dom";
import "./BottomNav.css";

function BottomNav({ session }) {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className="bottom-nav-item">
        <span>⌂</span>
        <small>Home</small>
      </NavLink>

      <NavLink to="/friends" className="bottom-nav-item">
        <span>♡</span>
        <small>Friends</small>
      </NavLink>

      <NavLink to="/groups" className="bottom-nav-item">
        <span>☕</span>
        <small>Groups</small>
      </NavLink>

      <NavLink to="/timer" className="bottom-nav-item">
        <span>⏱</span>
        <small>Timer</small>
      </NavLink>

      <NavLink
        to={session?.user ? "/profile" : "/login"}
        className="bottom-nav-item"
      >
        <span>◉</span>
        <small>Profile</small>
      </NavLink>
    </nav>
  );
}

export default BottomNav;