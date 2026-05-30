export default function RoleBadge({ role }) {
  const cleanRole = role || "user";
  return <span className={`role-badge ${cleanRole}`}>{cleanRole}</span>;
}
