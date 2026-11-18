import { ORDER_STATUSES } from '../api/orders';

export function getStatusLabel(t, status) {
  return t(`status.${status}`) === `status.${status}`
    ? (ORDER_STATUSES[status]?.label || status)
    : t(`status.${status}`);
}
