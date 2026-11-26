
import { useEffect, useRef, useState } from "react";
import Letterbox from "./features/letterbox/Letterbox"; 
import Diary from "./features/diary/Diary";
import FutureMe from "./features/futureMe/FutureMe";
import Memories from "./features/memories/Memories";
import AboutMe from "./features/aboutme/AboutMe";
import Settings from "./features/settings/Settings";
import "./App.css";

const apps = [
  { id: "letters", icon: "💌", name: "Letterbox" },
  { id: "diary", icon: "📓", name: "My Diary" },
  { id: "future", icon: "🎀", name: "Future Me" },
  { id: "memories", icon: "📸", name: "Memories" },
  { id: "about", icon: "💗", name: "About Me" },
  { id: "settings", icon: "⚙️", name: "Settings" },
];

function App({ user, onLogout }) {
  const [windows, setWindows] = useState([]);
  const [startMenu, setStartMenu] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [nextZ, setNextZ] = useState(10);

  const desktopRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Global pointer movement for dragging windows
  useEffect(() => {
    function handlePointerMove(event) {
      if (!dragRef.current) return;

      const { id, offsetX, offsetY } = dragRef.current;
      const desktopRect = desktopRef.current?.getBoundingClientRect();

      if (!desktopRect) return;

      const x = Math.max(
        0,
        Math.min(
          event.clientX - desktopRect.left - offsetX,
          desktopRect.width - 180
        )
      );

      const y = Math.max(
        45,
        Math.min(
          event.clientY - desktopRect.top - offsetY,
          desktopRect.height - 100
        )
      );

      setWindows((previous) =>
        previous.map((win) =>
          win.id === id ? { ...win, x, y } : win
        )
      );
    }

    function handlePointerUp() {
      dragRef.current = null;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  function openApp(id) {
    const existing = windows.find((win) => win.id === id);

    if (existing) {
      setWindows((previous) =>
        previous.map((win) =>
          win.id === id
            ? { ...win, minimized: false, zIndex: nextZ }
            : win
        )
      );
    } else {
      const offset = windows.length * 28;

      setWindows((previous) => [
        ...previous,
        {
          id,
          x: 210 + offset,
          y: 110 + offset,
          zIndex: nextZ,
          minimized: false,
          maximized: false,
          restore: null,
        },
      ]);
    }

    setNextZ((value) => value + 1);
    setStartMenu(false);
  }

  function focusWindow(id) {
    setWindows((previous) =>
      previous.map((win) =>
        win.id === id
          ? { ...win, zIndex: nextZ, minimized: false }
          : win
      )
    );
    setNextZ((value) => value + 1);
  }

  function closeWindow(id) {
    setWindows((previous) =>
      previous.filter((win) => win.id !== id)
    );
  }

  function minimizeWindow(id) {
    setWindows((previous) =>
      previous.map((win) =>
        win.id === id ? { ...win, minimized: true } : win
      )
    );
  }

  function maximizeWindow(id) {
    setWindows((previous) =>
      previous.map((win) => {
        if (win.id !== id) return win;

        if (win.maximized) {
          return {
            ...win,
            ...win.restore,
            maximized: false,
            restore: null,
          };
        }

        return {
          ...win,
          restore: { x: win.x, y: win.y },
          maximized: true,
        };
      })
    );
  }

  function startDragging(event, id) {
    if (event.button !== 0) return;

    const rect = event.currentTarget.parentElement.getBoundingClientRect();
    const desktopRect = desktopRef.current.getBoundingClientRect();

    if (windows.find((win) => win.id === id)?.maximized) return;

    focusWindow(id);

    dragRef.current = {
      id,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };

    event.preventDefault();
  }

  function renderContent(id) {
    switch (id) {
      case "letters":
        return <Letterbox />

      case "diary":
        return <Diary />;

      case "future":
        return <FutureMe />

      case "memories":
        return <Memories />

      case "about":
        return <AboutMe />

      case "settings":
        return <Settings/>

      default:
        return null;
    }
  }

  return (
    <main className="desktop" ref={desktopRef}>
      <header className="desktop-topbar">
        <div className="brand">DEARLY<span>.EXE</span> ♡</div>
        <div className="topbar-message">
          MY LITTLE CORNER OF THE INTERNET
        </div>
        <div className="online-status">
          <span className="status-dot" /> ONLINE
        </div>

        <div className="account-controls">
          <span className="account-name">
            {user?.name}
          </span>
          <button className="logout-button" onClick={onLogout}>
            LOG OUT
          </button>
        </div>
      </header>

      <section className="desktop-icons">
        {apps.map((app) => (
          <button
            className="desktop-icon"
            key={app.id}
            onClick={() => openApp(app.id)}
            title={`Open ${app.name}`}
          >
            <span className="icon-tile">{app.icon}</span>
            <span className="icon-label">{app.name}</span>
          </button>
        ))}
      </section>

      <section className="welcome-area">
        <div className="welcome-window">
          <div className="window-bar">
            <span>✿ WELCOME.TXT</span>
            <span>♡</span>
          </div>

          <div className="welcome-content">
            <div className="welcome-decoration">♡</div>
            <p className="welcome-small">
              A LITTLE PLACE FOR YOUR FEELINGS
            </p>
            <h1>Dear you,</h1>
            <h2>Welcome home.</h2>
            <p className="welcome-description">
              Your letters, your memories, your dreams
              and all the things you cannot quite say.
            </p>
            <button
              className="pixel-button"
              onClick={() => openApp("letters")}
            >
              OPEN MY LETTERBOX →
            </button>
            <p className="welcome-footer">
              MADE WITH LOVE, JUST FOR YOU ♡
            </p>
          </div>
        </div>

        <div className="floating-decoration decoration-one">✿</div>
        <div className="floating-decoration decoration-two">♥</div>
        <div className="floating-decoration decoration-three">✦</div>
      </section>

      {/* Independent application windows */}
      {windows.map((win) => {
        const app = apps.find((item) => item.id === win.id);

        if (win.minimized) return null;

        return (
          <section
            key={win.id}
            className={`app-window ${win.maximized ? "maximized" : ""}`}
            style={{
              left: win.maximized ? 0 : win.x,
              top: win.maximized ? 45 : win.y,
              zIndex: win.zIndex,
            }}
            onPointerDown={() => focusWindow(win.id)}
          >
            <div
              className="window-bar draggable-titlebar"
              onPointerDown={(event) => startDragging(event, win.id)}
            >
              <span>{app.icon} {app.name}</span>

              <div className="window-controls">
                <button
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => minimizeWindow(win.id)}
                  aria-label="Minimize"
                >
                  _
                </button>
                <button
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => maximizeWindow(win.id)}
                  aria-label="Maximize or restore"
                >
                  □
                </button>
                <button
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => closeWindow(win.id)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="app-window-content">
              {renderContent(win.id)}
            </div>
          </section>
        );
      })}

      {/* Start menu */}
      {startMenu && (
        <div className="start-menu">
          <div className="start-menu-header">
            <span>♡</span>
            <div>
              <strong>DEARLY.EXE</strong>
              <small>Your personal world</small>
            </div>
          </div>

          <p className="menu-heading">MY APPLICATIONS</p>

          {apps.map((app) => (
            <button
              key={app.id}
              className="start-menu-item"
              onClick={() => openApp(app.id)}
            >
              <span>{app.icon}</span>
              {app.name}
            </button>
          ))}

          <div className="menu-footer">
            A LITTLE WORLD OF YOUR OWN ♡
          </div>
        </div>
      )}

      {/* Taskbar */}
      <footer className="taskbar">
        <button
          className="start-button"
          onClick={() => setStartMenu(!startMenu)}
        >
          ♡ START
        </button>

        <div className="taskbar-divider" />

        {windows.map((win) => {
          const app = apps.find((item) => item.id === win.id);

          return (
            <button
              key={win.id}
              className={`taskbar-app ${
                !win.minimized ? "taskbar-active" : ""
              }`}
              onClick={() => {
                if (!win.minimized) {
                  minimizeWindow(win.id);
                } else {
                  focusWindow(win.id);
                }
              }}
            >
              {app.icon} {app.name}
            </button>
          );
        })}

        <div className="taskbar-spacer" />

        <div className="taskbar-status">
          <span>♥</span>
          <span>WI-FI</span>
        </div>

        <div className="taskbar-clock">
          <span>
            {clock.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <small>
            {clock.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </small>
        </div>
      </footer>
    </main>
  );
}

export default App;
