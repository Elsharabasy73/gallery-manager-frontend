import { ORDER_STATUSES } from '../../../api/orders';

export function OrderStatusTimeline({ order, statusLabel, getStatusStyles, t }) {
  return (
    <div className="bg-white border border-[#E7DFD3] rounded-xl p-4">
      <h3 className="text-sm font-medium mb-3">{t('orderDetails.timeline')}</h3>
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {['pending', 'accepted', 'paid', 'delivered', 'completed'].map((s, idx) => {
          const config = ORDER_STATUSES[s]
          const statusOrder = ['pending', 'accepted', 'paid', 'delivered', 'completed']
          const currentIndex = statusOrder.indexOf(order.status)
          const thisIndex = statusOrder.indexOf(s)
          const isActive = thisIndex <= currentIndex && currentIndex !== statusOrder.indexOf('cancelled')
          const isCurrent = s === order.status
          return <div key={s} className="flex items-center"><div className={`flex flex-col items-center ${isActive ? 'opacity-100' : 'opacity-40'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${isCurrent ? getStatusStyles(s) + ' ring-2 ring-offset-1' : isActive ? 'bg-[#E7DFD3]' : 'bg-zinc-100'}`}>{idx + 1}</div><span className="text-[10px] mt-1 text-[#8A8078]">{statusLabel(s)}</span></div>{idx < 4 && <div className={`w-8 h-0.5 mx-1 ${thisIndex < currentIndex ? 'bg-[#4B3621]' : 'bg-zinc-200'}`} />}</div>
        })}
      </div>
    </div>
  );
}

export default OrderStatusTimeline;
