function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">📍 Study Spots</div>

      <div className="navbar-links">
        <a onClick={() => document.getElementById("map")?.scrollIntoView({ behavior: "smooth" })}>
  Map
</a>

<a onClick={() => document.getElementById("places")?.scrollIntoView({ behavior: "smooth" })}>
  Places
</a>
        <button>Add a Spot</button>
      </div>
    </nav>
  );
}

export default Navbar;