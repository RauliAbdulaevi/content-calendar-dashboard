import { useEffect, useMemo, useState } from "react";
import CalendarView from "../components/CalendarView.jsx";
import AnalyticsPanel from "../components/AnalyticsPanel.jsx";
import ContentModal from "../components/ContentModal.jsx";
import FilterBar from "../components/FilterBar.jsx";
import Header from "../components/Header.jsx";
import ListView from "../components/ListView.jsx";
import Metrics from "../components/Metrics.jsx";
import PublishedStats from "../components/PublishedStats.jsx";
import { ErrorState } from "../components/RequestState.jsx";
import ViewToggle from "../components/ViewToggle.jsx";
import { addIdeaComment, createIdea, deleteIdea, getIdeas, getNotifications, updateIdea } from "../services/contentApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import { exportIdeasToCsv, filterIdeas, getAnalyticsSummary, getContentMetrics, getPublishedStats } from "../utils/content.js";

function getCurrentMonthStart() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

export default function DashboardPage() {
  const { user, isAdmin, logout, updateProfile } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [view, setView] = useState("calendar");
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingIdea, setEditingIdea] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() => getCurrentMonthStart());
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState(() => new Set(JSON.parse(localStorage.getItem("read-notifications") || "[]")));
  const [filters, setFilters] = useState({ search: "", status: "All", platform: "All", contentType: "All", campaign: "", creator: "", dateFrom: "", dateTo: "" });

  const filteredIdeas = useMemo(() => filterIdeas(ideas, filters), [ideas, filters]);
  const metrics = useMemo(() => getContentMetrics(ideas), [ideas]);
  const publishedStats = useMemo(() => getPublishedStats(ideas), [ideas]);
  const analytics = useMemo(() => getAnalyticsSummary(ideas), [ideas]);

  async function loadIdeas() {
    setLoading(true);
    setError("");

    try {
      const ideasData = await getIdeas();
      setIdeas(ideasData);
      setNotifications(await getNotifications());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIdeas();
  }, []);

  async function handleCreateIdea(payload) {
    setError("");
    const createdIdea = await createIdea(payload);
    setIdeas((currentIdeas) => [...currentIdeas, createdIdea]);
    closeContentModal();
  }

  async function handleUpdateIdea(id, payload) {
    setError("");
    const updatedIdea = await updateIdea(id, payload);
    setIdeas((currentIdeas) => currentIdeas.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea)));
    closeContentModal();
  }

  async function handleAddComment(id, message) {
    setError("");
    const updatedIdea = await addIdeaComment(id, { message });
    setIdeas((currentIdeas) => currentIdeas.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea)));
    setEditingIdea((current) => (current?.id === updatedIdea.id ? updatedIdea : current));
  }

  async function handleDeleteIdea(id) {
    setError("");
    await deleteIdea(id);
    setIdeas((currentIdeas) => currentIdeas.filter((idea) => idea.id !== id));
    closeContentModal();
  }

  async function handleMoveIdea(id, scheduledDate) {
    const idea = ideas.find((item) => item.id === id);

    if (!idea || idea.scheduledDate === scheduledDate) {
      return;
    }

    setError("");
    try {
      const updatedIdea = await updateIdea(id, { ...idea, scheduledDate });
      setIdeas((currentIdeas) => currentIdeas.map((item) => (item.id === updatedIdea.id ? updatedIdea : item)));
    } catch (moveError) {
      setError(moveError.message);
    }
  }

  function shiftMonth(amount) {
    setCurrentMonth((date) => new Date(date.getFullYear(), date.getMonth() + amount, 1));
  }

  function openContentModal(date = null) {
    setSelectedDate(date);
    setEditingIdea(null);
    setModalOpen(true);
  }

  function openEditModal(idea) {
    setSelectedDate(null);
    setEditingIdea(idea);
    setModalOpen(true);
  }

  function closeContentModal() {
    setModalOpen(false);
    setSelectedDate(null);
    setEditingIdea(null);
  }

  function markNotificationRead(id) {
    setReadNotifications((current) => {
      const next = new Set(current);
      next.add(id);
      localStorage.setItem("read-notifications", JSON.stringify([...next]));
      return next;
    });
  }

  function handleExportCsv() {
    const blob = new Blob([exportIdeasToCsv(filteredIdeas)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "content-calendar.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const notificationItems = notifications.map((notification) => ({
    ...notification,
    read: readNotifications.has(notification.id)
  }));

  return (
    <main className="app-shell">
      <section className="dashboard">
        <Header onNewContent={() => openContentModal()} user={user} isAdmin={isAdmin} onLogout={logout} onUpdateProfile={updateProfile} />
        <Metrics metrics={metrics} />
        <PublishedStats stats={publishedStats} />
        <AnalyticsPanel analytics={analytics} />
        <section className="notification-panel" aria-label="Notifications">
          <div className="section-heading">
            <h2>Notifications</h2>
            <span>{notificationItems.filter((item) => !item.read).length} unread</span>
          </div>
          {notificationItems.length ? (
            <div className="notification-list">
              {notificationItems.map((notification) => (
                <button
                  className={`notification-item ${notification.read ? "read" : ""}`}
                  key={notification.id}
                  type="button"
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <span>{notification.title}</span>
                  <strong>{notification.message}</strong>
                </button>
              ))}
            </div>
          ) : (
            <p className="empty-inline">No reminders right now.</p>
          )}
        </section>
        <div className="workspace-bar">
          <ViewToggle view={view} onChange={setView} />
          <p>{ideas.length ? `${filteredIdeas.length} of ${ideas.length} ideas shown` : "Your workspace is ready"}</p>
          <button type="button" className="secondary-button export-button" onClick={handleExportCsv} disabled={!filteredIdeas.length}>
            Export CSV
          </button>
        </div>
        <FilterBar filters={filters} onChange={setFilters} resultCount={filteredIdeas.length} />
        {error && !isLoading && <ErrorState message={error} onRetry={loadIdeas} />}
        {isLoading ? (
          <section className="surface-state">Loading your content calendar...</section>
        ) : error ? null : view === "calendar" ? (
          !filteredIdeas.length ? (
            <section className="empty-workspace">
              <strong>{ideas.length ? "No posts match these filters" : "Plan your first campaign"}</strong>
              <span>{ideas.length ? "Reset filters or broaden your search to see more content." : "Create content, generate ideas, or map your next launch."}</span>
              <div>
                <button type="button" className="primary-button" onClick={() => openContentModal()}>
                  Create first post
                </button>
                <button type="button" className="secondary-button" onClick={() => openContentModal()}>
                  Generate ideas
                </button>
              </div>
            </section>
          ) : (
          <CalendarView
            ideas={filteredIdeas}
            currentMonth={currentMonth}
            onPrevious={() => shiftMonth(-1)}
            onNext={() => shiftMonth(1)}
            onToday={() => setCurrentMonth(getCurrentMonthStart())}
            onSelectDate={openContentModal}
            onEditIdea={openEditModal}
            onMoveIdea={handleMoveIdea}
          />
          )
        ) : (
          <ListView ideas={filteredIdeas} onDeleteIdea={handleDeleteIdea} onEditIdea={openEditModal} />
        )}
      </section>

      {isModalOpen && (
        <ContentModal
          idea={editingIdea}
          onClose={closeContentModal}
          onCreate={handleCreateIdea}
          onUpdate={handleUpdateIdea}
          onDelete={handleDeleteIdea}
          selectedDate={selectedDate}
          currentUser={user}
          onAddComment={handleAddComment}
        />
      )}
    </main>
  );
}
