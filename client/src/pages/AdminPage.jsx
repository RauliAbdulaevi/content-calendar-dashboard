import { useEffect, useMemo, useState } from "react";
import { Activity, FileText, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import RoleBadge from "../components/RoleBadge.jsx";
import { ErrorState, LoadingRows } from "../components/RequestState.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { deleteIdea, getIdeas } from "../services/contentApi.js";
import { deleteUser, getActivityLogs, getUsers, recoverUserFromActivity, updateUserRole } from "../services/userApi.js";
import { getStatusClass } from "../utils/content.js";
import { formatReadableDate, formatTime } from "../utils/date.js";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(true);

  async function loadAdminData() {
    setLoading(true);
    setError("");

    try {
      const [usersData, ideasData, activityData] = await Promise.all([getUsers(), getIdeas(), getActivityLogs()]);
      setUsers(usersData);
      setIdeas(ideasData);
      setActivityLogs(activityData);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const usersById = useMemo(() => {
    return users.reduce((map, item) => {
      map[item.id] = item;
      return map;
    }, {});
  }, [users]);

  const adminStats = useMemo(() => {
    return [
      { label: "Users", value: users.length, icon: Users },
      { label: "Admins", value: users.filter((item) => item.role === "admin").length, icon: ShieldCheck },
      { label: "Content Ideas", value: ideas.length, icon: FileText },
      { label: "Recent Activity", value: activityLogs.length, icon: Activity }
    ];
  }, [activityLogs.length, ideas.length, users]);

  const recoverableLogs = useMemo(() => activityLogs.filter((log) => log.canRecover), [activityLogs]);

  async function refreshActivity() {
    const activityData = await getActivityLogs();
    setActivityLogs(activityData);
  }

  async function handleRecoverUser(activityId) {
    setError("");

    try {
      await recoverUserFromActivity(activityId);
      await loadAdminData();
    } catch (recoverError) {
      setError(recoverError.message);
    }
  }

  async function handleRoleChange(id, role) {
    setError("");
    try {
      const updated = await updateUserRole(id, role);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      await refreshActivity();
    } catch (roleError) {
      setError(roleError.message);
    }
  }

  async function handleDeleteUser(targetUser) {
    const confirmed = window.confirm(`Delete ${targetUser.email} and all of their content ideas?`);

    if (!confirmed) {
      return;
    }

    setError("");
    try {
      await deleteUser(targetUser.id);
      setUsers((current) => current.filter((item) => item.id !== targetUser.id));
      setIdeas((current) => current.filter((idea) => idea.userId !== targetUser.id));
      await refreshActivity();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function handleDeleteIdea(idea) {
    const confirmed = window.confirm(`Delete "${idea.title}"?`);

    if (!confirmed) {
      return;
    }

    setError("");
    try {
      await deleteIdea(idea.id);
      setIdeas((current) => current.filter((item) => item.id !== idea.id));
      await refreshActivity();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <main className="app-shell">
      <section className="dashboard admin-dashboard">
        <header className="header">
          <div>
            <h1>Admin Panel</h1>
            <p>Manage users, roles, and every content idea in the calendar.</p>
          </div>
          <div className="header-actions">
            <span className="signed-in-user">{user?.name}</span>
            <RoleBadge role={user?.role} />
            <Link className="secondary-button nav-button" to="/dashboard">
              Dashboard
            </Link>
            <button className="secondary-button" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        {error && !isLoading && <ErrorState message={error} onRetry={loadAdminData} />}

        <section className="admin-summary-grid" aria-label="Admin overview">
          {adminStats.map(({ label, value, icon: Icon }) => (
            <article className="admin-summary-card" key={label}>
              <span>
                <Icon size={17} />
              </span>
              <div>
                <p>{label}</p>
                <strong>{value}</strong>
              </div>
            </article>
          ))}
        </section>

        <section className="admin-section">
          <div className="section-heading">
            <h2>Users</h2>
            <span>{users.length} total</span>
          </div>
          <div className="admin-table-shell">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <LoadingRows columns={5} />}
                {!isLoading && !users.length && (
                  <tr>
                    <td colSpan="5">No users found.</td>
                  </tr>
                )}
                {!isLoading &&
                  users.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>
                        <select
                          value={item.role}
                          onChange={(event) => handleRoleChange(item.id, event.target.value)}
                          disabled={item.id === user?.id}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td>{formatReadableDate(item.createdAt.slice(0, 10))}</td>
                      <td>
                        <button
                          className="danger-button row-delete-button"
                          onClick={() => handleDeleteUser(item)}
                          disabled={item.id === user?.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section">
          <div className="section-heading">
            <h2>Recover Deleted Users</h2>
            <span>{recoverableLogs.length} available</span>
          </div>
          <div className="recovery-list">
            {isLoading && <span className="skeleton-line" />}
            {!isLoading && !recoverableLogs.length && <p>No deleted users are available to recover.</p>}
            {!isLoading &&
              recoverableLogs.map((log) => (
                <article className="recovery-item" key={log.id}>
                  <div>
                    <strong>{log.message.replace("Deleted ", "")}</strong>
                    <p>
                      Deleted by {log.userEmail} on {formatReadableDate(log.createdAt.slice(0, 10))}
                    </p>
                  </div>
                  <button className="secondary-button recover-button" onClick={() => handleRecoverUser(log.id)} type="button">
                    Recover User
                  </button>
                </article>
              ))}
          </div>
        </section>

        <section className="admin-section">
          <div className="section-heading">
            <h2>All Content Ideas</h2>
            <span>{ideas.length} total</span>
          </div>
          <div className="admin-table-shell">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Schedule</th>
                  <th>Platform</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <LoadingRows columns={6} />}
                {!isLoading && !ideas.length && (
                  <tr>
                    <td colSpan="6">No content ideas found.</td>
                  </tr>
                )}
                {!isLoading &&
                  ideas.map((idea) => (
                    <tr key={idea.id}>
                      <td>{idea.title}</td>
                      <td>{usersById[idea.userId]?.email || "Unknown"}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(idea.status)}`}>{idea.status}</span>
                      </td>
                      <td>
                        {formatReadableDate(idea.scheduledDate)} at {formatTime(idea.scheduledTime)}
                      </td>
                      <td>{idea.platform}</td>
                      <td>
                        <button className="danger-button row-delete-button" onClick={() => handleDeleteIdea(idea)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section">
          <div className="section-heading">
            <h2>Activity Log</h2>
            <span>{activityLogs.length} recent actions</span>
          </div>
          <div className="activity-list">
            {isLoading && (
              <>
                <span className="skeleton-line" />
                <span className="skeleton-line short" />
              </>
            )}
            {!isLoading && !activityLogs.length && <p>No activity has been recorded yet.</p>}
            {!isLoading &&
              activityLogs.slice(0, 8).map((log) => (
                <article className="activity-item" key={log.id}>
                  <div className="activity-item-header">
                    <span>{log.action.replace(".", " ")}</span>
                    {log.canRecover && (
                      <button className="secondary-button recover-button" onClick={() => handleRecoverUser(log.id)} type="button">
                        Recover
                      </button>
                    )}
                  </div>
                  <strong>{log.message}</strong>
                  <p>
                    {log.userEmail} - {formatReadableDate(log.createdAt.slice(0, 10))}
                    {log.recoveredAt ? ` - recovered ${formatReadableDate(log.recoveredAt.slice(0, 10))}` : ""}
                  </p>
                </article>
              ))}
          </div>
        </section>
      </section>
    </main>
  );
}
