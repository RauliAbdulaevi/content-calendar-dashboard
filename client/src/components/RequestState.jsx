import { RefreshCw } from "lucide-react";

export function ErrorState({ message, onRetry }) {
  return (
    <section className="surface-state error-state" role="alert">
      <strong>Something needs another try</strong>
      <p>{message || "The request could not be completed."}</p>
      {onRetry && (
        <button className="secondary-button" type="button" onClick={onRetry}>
          <RefreshCw size={15} />
          Retry
        </button>
      )}
    </section>
  );
}

export function LoadingRows({ columns = 5, rows = 3 }) {
  return Array.from({ length: rows }, (_, rowIndex) => (
    <tr className="loading-row" key={rowIndex}>
      {Array.from({ length: columns }, (_, columnIndex) => (
        <td key={columnIndex}>
          <span className="skeleton-line" />
        </td>
      ))}
    </tr>
  ));
}
