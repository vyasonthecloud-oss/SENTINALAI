"use client";

import { useState, useTransition } from 'react';
import { updateOrderStatusAction } from './orderActions';
import { OrderStatus } from '@/types/database';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  AlertCircle
} from 'lucide-react';

export function StatusUpdater({ 
  orderId, 
  currentStatus 
}: { 
  orderId: string; 
  currentStatus: string; 
}) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleUpdate = (targetStatus: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, targetStatus);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message || 'Status updated successfully' });
        setShowCancelConfirm(false);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to update status' });
      }
    });
  };

  const isTerminal = currentStatus === OrderStatus.DELIVERED || currentStatus === OrderStatus.CANCELLED;

  return (
    <div className="space-y-4">
      {feedback && (
        <div 
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border animate-in fade-in ${
            feedback.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
              : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {isTerminal ? (
        <div className="text-xs text-muted-foreground font-mono bg-card/60 p-3 rounded-xl border border-border/50 text-center">
          {currentStatus === OrderStatus.DELIVERED 
            ? '✓ Order is fulfilled and marked DELIVERED.' 
            : '✕ Order has been CANCELLED.'}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Advance Fulfillment
          </div>

          <div className="flex flex-wrap gap-2.5">
            {currentStatus === OrderStatus.PENDING && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleUpdate(OrderStatus.PROCESSING)}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
                <span>Mark as Processing</span>
              </button>
            )}

            {currentStatus === OrderStatus.PROCESSING && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleUpdate(OrderStatus.SHIPPED)}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                <span>Dispatch / Mark Shipped</span>
              </button>
            )}

            {currentStatus === OrderStatus.SHIPPED && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleUpdate(OrderStatus.DELIVERED)}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Mark as Delivered</span>
              </button>
            )}

            {(currentStatus === OrderStatus.PENDING || currentStatus === OrderStatus.PROCESSING) && (
              <>
                {!showCancelConfirm ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setShowCancelConfirm(true)}
                    className="bg-card hover:bg-rose-500/10 text-rose-500 hover:text-rose-400 border border-border hover:border-rose-500/30 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 ml-auto"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Order</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 ml-auto animate-in fade-in">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleUpdate(OrderStatus.CANCELLED)}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
                    >
                      {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                      <span>Confirm Cancel</span>
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setShowCancelConfirm(false)}
                      className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
