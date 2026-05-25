import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

function formatStudyTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours}h ${minutes}m`;
}

function getStartDateForFilter(filter) {
  const now = new Date();
  const start = new Date(now);

  if (filter === "daily") {
    start.setHours(0, 0, 0, 0);
  }

  if (filter === "weekly") {
    start.setDate(now.getDate() - 7);
  }

  if (filter === "monthly") {
    start.setMonth(now.getMonth() - 1);
  }

  if (filter === "yearly") {
    start.setFullYear(now.getFullYear() - 1);
  }

  return start;
}

function StudyStats({ session }) {
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState("weekly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudySessions() {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("study_sessions")
        .select(`
          id,
          duration_seconds,
          mode,
          started_at,
          ended_at,
          places (
            id,
            name,
            city,
            country,
            slug
          )
        `)
        .eq("user_id", session.user.id)
        .order("started_at", { ascending: false });

      if (error) {
        console.log("Error loading study sessions:", error);
      } else {
        setSessions(data || []);
      }

      setLoading(false);
    }

    fetchStudySessions();
  }, [session?.user?.id]);

  const filteredSessions = useMemo(() => {
    if (filter === "all") {
      return sessions;
    }

    const startDate = getStartDateForFilter(filter);

    return sessions.filter((studySession) => {
      const sessionDate = new Date(studySession.started_at);
      return sessionDate >= startDate;
    });
  }, [sessions, filter]);

  const totalSeconds = filteredSessions.reduce(
    (total, studySession) => total + Number(studySession.duration_seconds || 0),
    0
  );

  const placeTotals = filteredSessions.reduce((acc, studySession) => {
    const placeName = studySession.places?.name || "No place selected";

    if (!acc[placeName]) {
      acc[placeName] = {
        place: studySession.places,
        seconds: 0,
        count: 0,
      };
    }

    acc[placeName].seconds += Number(studySession.duration_seconds || 0);
    acc[placeName].count += 1;

    return acc;
  }, {});

  const placesSorted = Object.values(placeTotals).sort(
    (a, b) => b.seconds - a.seconds
  );

  if (!session?.user) {
    return null;
  }

  return (
    <section className="study-stats-card">
      <div className="study-stats-header">
        <div>
          <h2>Study activity</h2>
          <p>See how long you studied and where.</p>
        </div>

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="daily">Today</option>
          <option value="weekly">Last 7 days</option>
          <option value="monthly">Last 30 days</option>
          <option value="yearly">Last year</option>
          <option value="all">All time</option>
        </select>
      </div>

      {loading ? (
        <p>Loading study activity...</p>
      ) : (
        <>
          <div className="study-stats-summary">
            <div>
              <strong>{formatStudyTime(totalSeconds)}</strong>
              <span>Total study time</span>
            </div>

            <div>
              <strong>{filteredSessions.length}</strong>
              <span>Sessions</span>
            </div>

            <div>
              <strong>{placesSorted.length}</strong>
              <span>Places studied</span>
            </div>
          </div>

          {filteredSessions.length === 0 ? (
            <p className="study-empty-text">
              No study sessions for this filter yet.
            </p>
          ) : (
            <div className="study-place-list">
              {placesSorted.map((item) => (
                <article key={item.place?.id || item.place?.name}>
                  <div>
                    <h3>{item.place?.name || "No place selected"}</h3>
                    <p>
                      {item.place?.city || "No city"} · {item.count} sessions
                    </p>
                  </div>

                  <strong>{formatStudyTime(item.seconds)}</strong>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default StudyStats;