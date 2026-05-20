function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">📍 Study Spots</div>

      <div className="navbar-links">
        <a href="#map">Map</a>
        <a href="#places">Places</a>
        <button>Add a Spot</button>
      </div>
    </nav>
  );
}

export default Navbar;