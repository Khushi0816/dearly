import { useEffect, useState } from "react";
import Desktop from "./Desktop.jsx";
import Auth from "./features/auth/Auth.jsx";
import {
  getAccessToken,
  clearAccessToken,
  getCurrentUser,
} from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;
    const token = getAccessToken();

    if (!token) {
      setCheckingSession(false);
      return () => {
        active = false;
      };
    }

    getCurrentUser(token)
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        clearAccessToken();
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function handleLogout() {
    clearAccessToken();
    setUser(null);
  }

  if (checkingSession) {
    return (
      <main className="auth-loading">
        <div>Opening your little world... ♡</div>
      </main>
    );
  }

  if (!user) {
    return <Auth onAuthenticated={setUser} />;
  }

  return <Desktop user={user} onLogout={handleLogout} />;
}

export default App;
