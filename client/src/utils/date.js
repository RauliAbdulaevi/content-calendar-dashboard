export function toIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function buildCalendarCells(year, month) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmptyCells = firstDay.getDay();
  const cells = [];

  for (let index = 0; index < leadingEmptyCells; index += 1) {
    cells.push({ date: null, inMonth: false, iso: "" });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({ date, inMonth: true, iso: toIsoDate(date) });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, inMonth: false, iso: "" });
  }

  return cells;
}

export function formatReadableDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function formatTime(value = "") {
  if (!value) {
    return "No time";
  }

  const [hour, minute] = value.split(":").map(Number);
  return new Date(2026, 0, 1, hour, minute).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
}
