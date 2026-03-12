import { Clock, IndianRupee, ShoppingBag, Truck } from "lucide-react";
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

export function StatsBar({ orders }: Props) {
  const today = getTodayStr();
  const tomorrow = getTomorrowStr();

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.price, 0);
  const pendingPayments = orders.filter(
    (o) => o.paymentStatus === "Pending",
  ).length;
  const dueOrders = orders.filter(
    (o) =>
      (o.deliveryDate === today || o.deliveryDate === tomorrow) &&
      o.deliveryStatus !== "Delivered",
  ).length;

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      color: "text-primary",
      bg: "bg-accent",
      ocid: "stats.orders_card",
    },
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "text-primary",
      bg: "bg-accent",
      ocid: "stats.revenue_card",
    },
    {
      label: "Pending Payments",
      value: pendingPayments,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      ocid: "stats.pending_card",
    },
    {
      label: "Due Today / Tomorrow",
      value: dueOrders,
      icon: Truck,
      color: "text-orange-600",
      bg: "bg-orange-50",
      ocid: "stats.reminders_card",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.ocid}
          data-ocid={s.ocid}
          className="bg-card rounded-lg shadow-card p-4 flex flex-col gap-2 border border-border"
        >
          <div
            className={`w-9 h-9 rounded-md ${s.bg} flex items-center justify-center`}
          >
            <s.icon className={`w-4 h-4 ${s.color}`} />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">
              {s.value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
