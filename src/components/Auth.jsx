import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

function Auth({ session }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Account created. You can log in now!");
    }
  }

  async function signIn() {
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
        <p>Logged in as: {session.user.email}</p>
        <button onClick={signOut}>Log out</button>

        <Link to="/">
            <button>Back to homepage</button>
        </Link>
        </div>
    );
    }

  return (
    <div className="auth-box">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={signIn}>Log in</button>
      <button onClick={signUp}>Sign up</button>
    </div>
  );
}

export default Auth;