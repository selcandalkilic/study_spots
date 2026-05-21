import { Link } from "react-router-dom";
import Auth from "../components/Auth";

function LoginPage({ session }) {
  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        <Link to="/" className="back-home-link">
          ← Back to homepage
        </Link>

        <div className="login-header">
          <h1>Welcome back</h1>
          <p>Log in or create an account to review your favorite study spots.</p>
        </div>

        <Auth session={session} />
      </div>
    </div>
  );
}

export default LoginPage;