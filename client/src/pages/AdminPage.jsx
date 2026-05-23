import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import RoleBadge from "../components/RoleBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { deleteIdea, getIdeas } from "../services/contentApi.js";
import { deleteUser, getActivityLogs, getUsers, updateUserRole } from "../services/userApi.js";
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

  async function handleRoleChange(id, role) {
    setError("");
    try {
      const updated = await updateUserRole(id, role);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      const activityData = await getActivityLogs();
      setActivityLogs(activityData);
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
      const activityData = await getActivityLogs();
      setActivityLogs(activityData);
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
      const activityData = await getActivityLogs();
      setActivityLogs(activityData);
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
            <Link className="secondary-button nav-button" to="/dashboard">Dashboard</Link>
            <button className="secondary-button" onClick={logout}>Logout</button>
          </div>
        </header>

        {error && <p className="notice error">{error}</p>}

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
                {isLoading && (
                  <tr>
                    <td colSpan="5">Loading users...</td>
                  </tr>
                )}
                {!isLoading && !users.length && (
                  <tr>
                    <td colSpan="5">No users found.</td>
                  </tr>
                )}
                {!isLoading && users.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>
                      <select value={item.role} onChange={(event) => handleRoleChange(item.id, event.target.value)} disabled={item.id === user?.id}>
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>{formatReadableDate(item.createdAt.slice(0, 10))}</td>
                    <td>
                      <button className="danger-button row-delete-button" onClick={() => handleDeleteUser(item)} disabled={item.id === user?.id}>
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
                {isLoading && (
                  <tr>
                    <td colSpan="6">Loading content ideas...</td>
                  </tr>
                )}
                {!isLoading && !ideas.length && (
                  <tr>
                    <td colSpan="6">No content ideas found.</td>
                  </tr>
                )}
                {!isLoading && ideas.map((idea) => (
                  <tr key={idea.id}>
                    <td>{idea.title}</td>
                    <td>{usersById[idea.userId]?.email || "Unknown"}</td>
                    <td><span className={`status-badge ${getStatusClass(idea.status)}`}>{idea.status}</span></td>
                    <td>{formatReadableDate(idea.scheduledDate)} at {formatTime(idea.scheduledTime)}</td>
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
            {isLoading && <p>Loading activity...</p>}
            {!isLoading && !activityLogs.length && <p>No activity has been recorded yet.</p>}
            {!isLoading && activityLogs.slice(0, 8).map((log) => (
              <article className="activity-item" key={log.id}>
                <span>{log.action.replace(".", " ")}</span>
                <strong>{log.message}</strong>
                <p>{log.userEmail} - {formatReadableDate(log.createdAt.slice(0, 10))}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
