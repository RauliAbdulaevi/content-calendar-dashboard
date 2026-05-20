import { useEffect, useMemo, useState } from "react";
import CalendarView from "../components/CalendarView.jsx";
import ContentModal from "../components/ContentModal.jsx";
import Header from "../components/Header.jsx";
import ListView from "../components/ListView.jsx";
import Metrics from "../components/Metrics.jsx";
import PublishedStats from "../components/PublishedStats.jsx";
import ViewToggle from "../components/ViewToggle.jsx";
import { createIdea, getIdeas, updateIdea } from "../services/contentApi.js";
import { getContentMetrics, getPublishedStats } from "../utils/content.js";

export default function DashboardPage() {
  const [ideas, setIdeas] = useState([]);
  const [view, setView] = useState("calendar");
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingIdea, setEditingIdea] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1));

  useEffect(() => {
    getIdeas()
      .then(setIdeas)
      .catch(() => setIdeas([]));
  }, []);

  const metrics = useMemo(() => getContentMetrics(ideas), [ideas]);
  const publishedStats = useMemo(() => getPublishedStats(ideas), [ideas]);

  async function handleCreateIdea(payload) {
    const createdIdea = await createIdea(payload);
    setIdeas((currentIdeas) => [...currentIdeas, createdIdea]);
    closeContentModal();
  }

  async function handleUpdateIdea(id, payload) {
    const updatedIdea = await updateIdea(id, payload);
    setIdeas((currentIdeas) => currentIdeas.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea)));
    closeContentModal();
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
        <Header onNewContent={() => openContentModal()} />
        <Metrics metrics={metrics} />
        <PublishedStats stats={publishedStats} />
        <ViewToggle view={view} onChange={setView} />
        {view === "calendar" ? (
          <CalendarView
            ideas={ideas}
            currentMonth={currentMonth}
            onPrevious={() => shiftMonth(-1)}
            onNext={() => shiftMonth(1)}
            onToday={() => setCurrentMonth(new Date(2026, 4, 1))}
            onSelectDate={openContentModal}
            onEditIdea={openEditModal}
          />
        ) : (
          <ListView ideas={ideas} onEditIdea={openEditModal} />
        )}
      </section>

      {isModalOpen && (
        <ContentModal
          idea={editingIdea}
          onClose={closeContentModal}
          onCreate={handleCreateIdea}
          onUpdate={handleUpdateIdea}
          selectedDate={selectedDate}
        />
      )}
    </main>
  );
}
