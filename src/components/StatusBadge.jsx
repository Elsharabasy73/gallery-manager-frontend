import { getStatusStyles } from '../api/orders';

export default function StatusBadge({ status, className = '', children }) {
  return (
    <span className={`${className} ${getStatusStyles(status)}`}>
      {children}
    </span>
  );
}
