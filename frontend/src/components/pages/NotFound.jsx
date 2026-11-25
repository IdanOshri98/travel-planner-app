import { Link } from "react-router";

export default function NotFound({ title = "Page not found", message = "This page doesn't exist or was removed." }) {
  return (
    <main className="page">
      <div className="state-box empty">
        <div className="state-icon" aria-hidden="true">🧭</div>
        <h1>{title}</h1>
        <p>{message}</p>
        <Link to="/" className="btn btn-primary">Back to all trips</Link>
      </div>
    </main>
  );
}
