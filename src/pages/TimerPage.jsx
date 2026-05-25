import { supabase } from "../supabaseClient";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./TimerPage.css";

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function getSavedSessions() {
  const savedSessions = localStorage.getItem("studyTimerSessions");

  if (!savedSessions) {
    return [];
  }

  try {
    return JSON.parse(savedSessions);
  } catch (error) {
    console.log("Could not read saved timer sessions:", error);
    return [];
  }
}

function TimerPage({ session }) {
  const [mode, setMode] = useState("countdown");
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(getSavedSessions);
  const [places, setPlaces] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [savingSession, setSavingSession] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const sessionStartTimeRef = useRef(null);
  const countdownSavedRef = useRef(false);
  async function saveStudySession(seconds, completed) {
  if (seconds <= 0) {
    return;
  }

  const startedAt =
    sessionStartTimeRef.current ||
    sessionStartTime ||
    new Date(Date.now() - seconds * 1000);

  const endedAt = new Date();
  const placeName = getSelectedPlaceName();

  addSession({
    mode: mode === "countdown" ? "Countdown" : "Stopwatch",
    seconds,
    completed,
    placeName,
    startedAt,
    endedAt,
  });

  if (!session?.user) {
    return;
  }

  setSavingSession(true);

  const { error } = await supabase.from("study_sessions").insert({
    user_id: session.user.id,
    place_id: selectedPlaceId ? Number(selectedPlaceId) : null,
    mode: mode,
    duration_seconds: seconds,
    started_at: startedAt.toISOString(),
    ended_at: endedAt.toISOString(),
  });

  setSavingSession(false);

  if (error) {
    console.log("Study session save error:", error);
    alert(
      "The session was saved on this page, but could not be saved to your profile."
    );
  }
}
  useEffect(() => {
  async function fetchPlaces() {
    const { data, error } = await supabase
      .from("places")
      .select("id, name, city, country")
      .order("name", { ascending: true });

    if (error) {
      console.log("Error loading places:", error);
    } else {
      setPlaces(data || []);
    }

    setLoadingPlaces(false);
  }

  fetchPlaces();
}, []);
  const totalDurationSeconds = useMemo(() => {
    return Math.max(1, Number(durationMinutes) * 60);
  }, [durationMinutes]);

  useEffect(() => {
    localStorage.setItem("studyTimerSessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
  if (!isRunning) return;

  const intervalId = setInterval(() => {
    if (mode === "countdown") {
      setRemainingSeconds((previousSeconds) => {
        if (previousSeconds <= 1) {
          setIsRunning(false);
          return 0;
        }

        return previousSeconds - 1;
      });
    } else {
      setElapsedSeconds((previousSeconds) => previousSeconds + 1);
    }
  }, 1000);

  return () => clearInterval(intervalId);
}, [isRunning, mode]);
useEffect(() => {
  if (mode !== "countdown") return;
  if (remainingSeconds !== 0) return;
  if (isRunning) return;
  if (countdownSavedRef.current) return;

  countdownSavedRef.current = true;

  saveStudySession(totalDurationSeconds, true);
}, [remainingSeconds, isRunning, mode, totalDurationSeconds]);
  function formatDateOnly(date) {
  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
}

function formatTimeOnly(date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSelectedPlaceName() {
  const selectedPlace = places.find(
    (place) => String(place.id) === String(selectedPlaceId)
  );

  if (!selectedPlace) {
    return "No place selected";
  }

  return `${selectedPlace.name} · ${selectedPlace.city}`;
}
  function addSession({
  mode,
  seconds,
  completed,
  placeName,
  startedAt,
  endedAt,
}) {
  if (seconds <= 0) return;

  const safeStartedAt = startedAt || new Date(Date.now() - seconds * 1000);
  const safeEndedAt = endedAt || new Date();
  const newSession = { id: crypto.randomUUID(), mode, seconds, completed, placeName: placeName || "No place selected", 
    date: formatDateOnly(safeStartedAt), timeRange: `${formatTimeOnly(safeStartedAt)} - ${formatTimeOnly(safeEndedAt)}`,};

  setSessions((previousSessions) => [newSession, ...previousSessions]);
}

  function changeMode(newMode) {
    setMode(newMode);
    setIsRunning(false);

    if (newMode === "countdown") {
      setRemainingSeconds(totalDurationSeconds);
    } else {
      setElapsedSeconds(0);
    }
  }

  function handleDurationChange(value) {
    const numberValue = Number(value);

    if (numberValue < 1) {
      setDurationMinutes(1);
      setRemainingSeconds(60);
      return;
    }

    setDurationMinutes(numberValue);
    setRemainingSeconds(numberValue * 60);
    setIsRunning(false);
  }

  function startTimer() {
  if (mode === "countdown" && remainingSeconds === 0) {
    setRemainingSeconds(totalDurationSeconds);
  }

  const now = new Date();

  setSessionStartTime(now);
  sessionStartTimeRef.current = now;
  countdownSavedRef.current = false;

  setIsRunning(true);
}

  function pauseTimer() {
    setIsRunning(false);
  }

  async function stopTimer() {
  setIsRunning(false);

  if (mode === "countdown")
    {
    const studiedSeconds = totalDurationSeconds - remainingSeconds;
    countdownSavedRef.current = true;
    await saveStudySession(studiedSeconds, remainingSeconds === 0);
    setRemainingSeconds(totalDurationSeconds);
    } 
else {
    await saveStudySession(elapsedSeconds, true);
    setElapsedSeconds(0);
    }
  setSessionStartTime(null);
  sessionStartTimeRef.current = null;
}

  function resetTimer() {
    setIsRunning(false);

    if (mode === "countdown") {
      setRemainingSeconds(totalDurationSeconds);
    } else {
      setElapsedSeconds(0);
    }
  }

  function clearSessions() {
    setSessions([]);
  }

  function deleteSession(sessionId) {
    setSessions((previousSessions) =>
      previousSessions.filter((session) => session.id !== sessionId)
    );
  }

  function setPreset(minutes) {
    setDurationMinutes(minutes);
    setRemainingSeconds(minutes * 60);
    setIsRunning(false);
  }

  const displaySeconds =
    mode === "countdown" ? remainingSeconds : elapsedSeconds;

  const countdownProgress =
    mode === "countdown"
      ? remainingSeconds / totalDurationSeconds
      : Math.min(elapsedSeconds / 3600, 1);

  const circleStyle = {
    background: `conic-gradient(#6f5b86 ${
      countdownProgress * 360
    }deg, #eee8f6 0deg)`,
  };

  const totalStudiedSeconds = sessions.reduce(
    (total, session) => total + session.seconds,
    0
  );

  return (
    <main className="timer-page">
      <div className="timer-card">
        <Link to="/" className="timer-back-link">
          ← Back to homepage
        </Link>

        <div className="timer-header">
          <span className="timer-pill">Focus tool</span>
          <h1>Study Timer</h1>
          <p>
            Use a countdown for planned study sessions, or start from zero and
            track how long you worked.
          </p>
        </div>

        <div className="timer-place-box">
            <label>Where are you studying?</label>
            <select
            value={selectedPlaceId}
            onChange={(event) => setSelectedPlaceId(event.target.value)}
            disabled={loadingPlaces || isRunning}
            >
                <option value="">
                    {loadingPlaces ? "Loading places..." : "No place selected"}
                    </option>
                    {places.map((place) => (
                        <option key={place.id} value={place.id}>
                            {place.name} · {place.city}, {place.country}
                            </option>
                        ))}
                        </select>
                            </div>

        <div className="timer-mode-tabs">
          <button
            type="button"
            className={mode === "countdown" ? "active" : ""}
            onClick={() => changeMode("countdown")}
          >
            Countdown
          </button>

          <button
            type="button"
            className={mode === "stopwatch" ? "active" : ""}
            onClick={() => changeMode("stopwatch")}
          >
            Stopwatch
          </button>
        </div>

        <section className="timer-circle-wrapper">
          <div className="timer-circle" style={circleStyle}>
            <div className="timer-circle-inner">
              <strong>{formatTime(displaySeconds)}</strong>
              <span>
                {isRunning
                  ? "Focus time"
                  : mode === "countdown"
                  ? "Ready to start"
                  : "Track your session"}
              </span>
            </div>
          </div>
        </section>

        {mode === "countdown" && (
          <div className="timer-duration-box">
            <label htmlFor="duration">Duration in minutes</label>

            <input
              id="duration"
              type="number"
              min="1"
              value={durationMinutes}
              onChange={(event) => handleDurationChange(event.target.value)}
            />

            <div className="timer-presets">
              {[25, 45, 60].map((minutes) => (
                <button
                  type="button"
                  key={minutes}
                  onClick={() => setPreset(minutes)}
                >
                  {minutes} min
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="timer-actions">
          {!isRunning ? (
            <button type="button" className="timer-start" onClick={startTimer}>
              Start
            </button>
          ) : (
            <button type="button" className="timer-pause" onClick={pauseTimer}>
              Pause
            </button>
          )}

          <button type="button" className="timer-stop" onClick={stopTimer} disabled={savingSession}>
            {savingSession ? "Saving..." : "Stop & Save"}
            </button>

          <button type="button" className="timer-reset" onClick={resetTimer}>
            Reset
          </button>
        </div>

        <div className="timer-summary">
          <div>
            <strong>{sessions.length}</strong>
            <span>saved sessions</span>
          </div>

          <div>
            <strong>{formatTime(totalStudiedSeconds)}</strong>
            <span>total focused time</span>
          </div>
        </div>

        <section className="session-list-section">
          <div className="session-list-header">
            <div>
              <h2>Study sessions</h2>
              <p>Your recorded focus sessions appear here.</p>
            </div>

            {sessions.length > 0 && (
                <button
                type="button"
                className="clear-sessions-desktop"
                onClick={clearSessions}
                >
                    Clear all
                </button>
            )}
          </div>
          {!session?.user && (
            <div className="timer-login-warning session-warning">
                <span>
                    Guest mode: Your sessions stay here for now. Log in to save your study history to your profile. 
                </span>
                <Link to="/login" className="session-login-link">
                Log in
                </Link>
            </div>
        )}

          {sessions.length === 0 ? (
            <p className="empty-session-text">
              No sessions recorded yet. Start studying and save your first one.
            </p>
          ) : (
            <div className="session-list">
              {sessions.map((session, index) => (
                <article className="session-item" key={session.id}>
                  <div className="session-number">{sessions.length - index}</div>

                  <div>
                    <strong>{formatTime(session.seconds)}</strong>
                    <span>
                        {session.mode} · {session.placeName || "No place selected"} ·{" "}
                        {session.date} · {session.timeRange}
                    </span>
                  </div>
                  <div className="session-actions">
                    <p>{session.completed ? "Completed" : "Stopped early"}</p>

                    <button
                      type="button"
                      onClick={() => deleteSession(session.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
            )}

{sessions.length > 0 && (
  <button
    type="button"
    className="clear-sessions-mobile"
    onClick={clearSessions}
  >
    Clear all
  </button>
)}
        </section>
      </div>
    </main>
  );
}

export default TimerPage;