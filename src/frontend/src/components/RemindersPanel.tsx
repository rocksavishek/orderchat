import { Bell, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { Order } from "../backend.d";

interface Props {
  orders: Order[];
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function formatDateLabel(dateStr: string): string {
  const today = getTodayStr();
  const tomorrow = getTomorrowStr();
  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function RemindersPanel({ orders }: Props) {
  const [open, setOpen] = useState(true);
  const today = getTodayStr();
  const tomorrow = getTomorrowStr();

  const dueOrders = orders.filter(
    (o) =>
      (o.deliveryDate === today || o.deliveryDate === tomorrow) &&
      o.deliveryStatus !== "Delivered",
  );

  if (dueOrders.length === 0) return null;

  return (
    <div
      data-ocid="reminders.panel"
      className="rounded-lg border border-amber-200 bg-amber-50 overflow-hidden animate-slide-in"
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-600 animate-pulse" />
          <span className="font-semibold text-amber-800 text-sm">
            {dueOrders.length} Delivery Reminder
            {dueOrders.length > 1 ? "s" : ""}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-amber-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-600" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-3 flex flex-col gap-2">
          {dueOrders.map((order, idx) => (
            <div
              key={order.id.toString()}
              data-ocid={`reminders.item.${idx + 1}`}
              className="flex items-center gap-2 text-sm text-amber-800"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              <span>
                Deliver <strong>{order.product}</strong> to{" "}
                <strong>{order.customerName}</strong> —{" "}
                <span className="font-medium">
                  {formatDateLabel(order.deliveryDate)}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
