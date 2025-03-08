import { Link } from "react-router-dom";
import "../css/navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-title">My Exchange</h1>
        <div className="navbar-links">
          <Link to="/">Add</Link>
          <Link to="/home">Home</Link>
          <Link to="/Playerdetails">players</Link>
          <Link to="/batsman">batsman</Link>
          <Link to="/bowler">bowler</Link>
          <Link to="/allrounder">allrounder</Link>
          <Link to="/scraper">scraper</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
