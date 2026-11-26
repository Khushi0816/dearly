import { useState } from "react";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  saveAccessToken,
} from "../../services/api";
import "./Auth.css";

function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isRegister = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (isRegister && password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        await registerUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });
      }

      const tokenData = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      saveAccessToken(tokenData.access_token);

      const user = await getCurrentUser(tokenData.access_token);

      onAuthenticated(user);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-one">✿</div>
      <div className="auth-decoration auth-decoration-two">♡</div>
      <div className="auth-decoration auth-decoration-three">✧</div>

      <section className="auth-card">
        <div className="auth-brand">DEARLY<span>.EXE</span></div>

        <div className="auth-envelope">💌</div>

        <p className="auth-eyebrow">
          A LITTLE PLACE JUST FOR YOU
        </p>

        <h1>
          {isRegister ? "A new beginning." : "Dear you,"}
        </h1>

        <p className="auth-subtitle">
          {isRegister
            ? "Let's create your little corner of the world."
            : "Welcome back to your little world."}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={!isRegister ? "auth-tab active" : "auth-tab"}
            onClick={() => changeMode("login")}
          >
            LOGIN
          </button>

          <button
            type="button"
            className={isRegister ? "auth-tab active" : "auth-tab"}
            onClick={() => changeMode("register")}
          >
            SIGN UP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <label>
              YOUR NAME
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="What should we call you?"
                maxLength={255}
                autoComplete="name"
                required
              />
            </label>
          )}

          <label>
            EMAIL ADDRESS
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            PASSWORD
            <div className="auth-password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                minLength={isRegister ? 8 : 1}
                maxLength={128}
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </label>

          {isRegister && (
            <label>
              CONFIRM PASSWORD
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter your password again"
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                required
              />
            </label>
          )}

          {error && (
            <p className="auth-error" role="alert">
              ♡ {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "PLEASE WAIT..."
              : isRegister
                ? "CREATE MY ACCOUNT ♡"
                : "OPEN MY DEARLY ♡"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister
            ? "Already have an account?"
            : "New to Dearly?"}

          <button
            type="button"
            onClick={() => changeMode(isRegister ? "login" : "register")}
          >
            {isRegister ? " Log in" : " Create an account"}
          </button>
        </p>

        <div className="auth-footer">
          MADE WITH LOVE, JUST FOR YOU ♡
        </div>
      </section>
    </main>
  );
}

export default Auth;
