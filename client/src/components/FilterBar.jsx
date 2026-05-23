import { Search } from "lucide-react";
import { contentTypes, platforms, statuses } from "../constants/content.js";

export default function FilterBar({ filters, onChange, resultCount }) {
  function updateFilter(event) {
    const { name, value } = event.target;
    onChange((current) => ({ ...current, [name]: value }));
  }

  return (
    <section className="filter-bar" aria-label="Content filters">
      <label className="search-field">
        <Search size={16} />
        <input name="search" value={filters.search} onChange={updateFilter} placeholder="Search title, caption, platform..." />
      </label>
      <select name="status" value={filters.status} onChange={updateFilter}>
        <option value="All">All statuses</option>
        {statuses.map((status) => (
          <option value={status} key={status}>{status}</option>
        ))}
      </select>
      <select name="platform" value={filters.platform} onChange={updateFilter}>
        <option value="All">All platforms</option>
        {platforms.map((platform) => (
          <option value={platform} key={platform}>{platform}</option>
        ))}
      </select>
      <select name="contentType" value={filters.contentType} onChange={updateFilter}>
        <option value="All">All types</option>
        {contentTypes.map((type) => (
          <option value={type} key={type}>{type}</option>
        ))}
      </select>
      <span>{resultCount} shown</span>
    </section>
  );
}
