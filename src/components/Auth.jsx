import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

function Auth({ session }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp() {
    if (!email || !password) {
      alert("Please enter an email and password.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert(
        "Account created! Please check your email and confirm your account before logging in."
      );
    }
  }

  async function signIn() {
    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (session) {
    return (
      <div className="auth-box">
        <p className="auth-status">Logged in as: {session.user.email}</p>

        <button className="secondary-auth-button" onClick={signOut}>
          Log out
        </button>

        <Link to="/">
          <button className="primary-auth-button">Back to homepage</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-box">
      <label>Email</label>
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label>Password</label>
      <input
        type="password"
        placeholder="Minimum 6 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="primary-auth-button" onClick={signIn}>
        Log in
      </button>

      <button className="secondary-auth-button" onClick={signUp}>
        Create account
      </button>
    </div>
  );
}

export default Auth;