import { Link } from "react-router-dom";
import Auth from "../components/Auth";

function LoginPage({ session }) {
  return (
    <div className="login-page">
      <Link to="/">
        <button className="home-button">← Back to homepage</button>
      </Link>

      <h1>Login</h1>
      <p>Log in or create an account to review study spots.</p>

      <Auth session={session} />
    </div>
  );
}

export default LoginPage;