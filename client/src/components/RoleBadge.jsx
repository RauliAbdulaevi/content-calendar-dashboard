export default function RoleBadge({ role }) {
  return <span className={`role-badge ${role === "admin" ? "admin" : "user"}`}>{role}</span>;
}
