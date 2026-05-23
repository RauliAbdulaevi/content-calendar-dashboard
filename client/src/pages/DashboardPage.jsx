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
import { createIdea, deleteIdea, getIdeas, updateIdea } from "../services/contentApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import { filterIdeas, getAnalyticsSummary, getContentMetrics, getPublishedStats } from "../utils/content.js";

function getCurrentMonthStart() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

export default function DashboardPage() {
  const { user, isAdmin, logout } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [view, setView] = useState("calendar");
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingIdea, setEditingIdea] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() => getCurrentMonthStart());
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", status: "All", platform: "All", contentType: "All" });

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

  return (
    <main className="app-shell">
      <section className="dashboard">
        <Header onNewContent={() => openContentModal()} user={user} isAdmin={isAdmin} onLogout={logout} />
        <Metrics metrics={metrics} />
        <PublishedStats stats={publishedStats} />
        <AnalyticsPanel analytics={analytics} />
        <div className="workspace-bar">
          <ViewToggle view={view} onChange={setView} />
          <p>{ideas.length ? `${filteredIdeas.length} of ${ideas.length} ideas shown` : "Your workspace is ready"}</p>
        </div>
        <FilterBar filters={filters} onChange={setFilters} resultCount={filteredIdeas.length} />
        {error && !isLoading && <ErrorState message={error} onRetry={loadIdeas} />}
        {isLoading ? (
          <section className="surface-state">Loading your content calendar...</section>
        ) : error ? null : view === "calendar" ? (
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
        />
      )}
    </main>
  );
}
