import { Link } from "react-router";

function AppHeader({ onNewTrip }) {
  return (
    <header className="header">
      <Link to="/" className="website-name" aria-label="Travel Planner home">
        <span aria-hidden="true">✈️</span> Travel Planner
      </Link>
      <button type="button" className="btn btn-primary btn-sm" onClick={onNewTrip}>
        + New trip
      </button>
    </header>
  );
}

export default AppHeader;
