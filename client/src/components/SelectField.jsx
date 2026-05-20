import { ChevronDown } from "lucide-react";

export default function SelectField({ label, name, value, onChange, options, placeholder }) {
  return (
    <label className="select-label">
      {label}
      <span className="select-shell">
        <select name={name} value={value} onChange={onChange}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown size={13} />
      </span>
    </label>
  );
}
