import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Order } from "../backend.d";
import {
  useDeleteOrder,
  useUpdateDeliveryStatus,
  useUpdatePaymentStatus,
} from "../hooks/useQueries";
import { WhatsAppTemplates } from "./WhatsAppTemplates";

interface Props {
  orders: Order[];
}

const PAYMENT_CYCLE = ["Pending", "Paid", "COD"];
const DELIVERY_CYCLE = ["Pending", "Out for Delivery", "Delivered"];

function nextInCycle(cycle: string[], current: string): string {
  const idx = cycle.indexOf(current);
  return cycle[(idx + 1) % cycle.length];
}

function PaymentBadge({
  status,
  onClick,
  ocid,
}: {
  status: string;
  onClick: () => void;
  ocid: string;
}) {
  const cls =
    status === "Paid"
      ? "status-paid"
      : status === "COD"
        ? "status-cod"
        : "status-pending";
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className={`${cls} inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition-all hover:opacity-80 active:scale-95`}
      title="Click to change payment status"
    >
      {status}
    </button>
  );
}

function DeliveryBadge({
  status,
  onClick,
  ocid,
}: {
  status: string;
  onClick: () => void;
  ocid: string;
}) {
  const cls =
    status === "Delivered"
      ? "status-delivered"
      : status === "Out for Delivery"
        ? "status-out-delivery"
        : "status-pending";
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className={`${cls} inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition-all hover:opacity-80 active:scale-95`}
      title="Click to change delivery status"
    >
      {status}
    </button>
  );
}

function formatDate(dateStr: string) {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  if (dateStr === today) return "Today";
  if (dateStr === tomorrowStr) return "Tomorrow";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function OrderRow({
  order,
  idx,
}: {
  order: Order;
  idx: number;
}) {
  const updatePayment = useUpdatePaymentStatus();
  const updateDelivery = useUpdateDeliveryStatus();
  const deleteOrder = useDeleteOrder();

  const handlePaymentToggle = async () => {
    const next = nextInCycle(PAYMENT_CYCLE, order.paymentStatus);
    try {
      await updatePayment.mutateAsync({ id: order.id, status: next });
      toast.success(`Payment status → ${next}`);
    } catch {
      toast.error("Failed to update payment status");
    }
  };

  const handleDeliveryToggle = async () => {
    const next = nextInCycle(DELIVERY_CYCLE, order.deliveryStatus);
    try {
      await updateDelivery.mutateAsync({ id: order.id, status: next });
      toast.success(`Delivery status → ${next}`);
    } catch {
      toast.error("Failed to update delivery status");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete order for ${order.customerName}?`)) return;
    try {
      await deleteOrder.mutateAsync(order.id);
      toast.success("Order deleted");
    } catch {
      toast.error("Failed to delete order");
    }
  };

  return (
    <TableRow
      data-ocid={`order.item.${idx}`}
      className="hover:bg-muted/40 transition-colors"
    >
      <TableCell className="font-medium">{order.customerName}</TableCell>
      <TableCell>
        <div>
          <p className="font-medium text-sm">{order.product}</p>
          <p className="text-xs text-muted-foreground">
            x{order.quantity.toString()}
          </p>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        {formatDate(order.deliveryDate)}
      </TableCell>
      <TableCell className="font-semibold text-foreground">
        ₹{order.price.toLocaleString("en-IN")}
      </TableCell>
      <TableCell>
        <PaymentBadge
          status={order.paymentStatus}
          onClick={handlePaymentToggle}
          ocid={`order.payment.toggle.${idx}`}
        />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <DeliveryBadge
          status={order.deliveryStatus}
          onClick={handleDeliveryToggle}
          ocid={`order.delivery.toggle.${idx}`}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <WhatsAppTemplates
            order={order}
            triggerOcid={`order.templates.button.${idx}`}
            popoverOcid={`order.templates.popover.${idx}`}
          />
          <Button
            variant="ghost"
            size="sm"
            data-ocid={`order.delete_button.${idx}`}
            onClick={handleDelete}
            disabled={deleteOrder.isPending}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
            title="Delete order"
          >
            {deleteOrder.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function OrdersTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div
        data-ocid="dashboard.empty_state"
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
          <ShoppingCart className="w-7 h-7 text-primary" />
        </div>
        <p className="font-display text-lg font-semibold text-foreground">
          No orders yet
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Add your first order using the button above
        </p>
      </div>
    );
  }

  return (
    <div
      data-ocid="dashboard.table"
      className="rounded-lg border border-border overflow-hidden"
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Customer</TableHead>
            <TableHead className="font-semibold">Product</TableHead>
            <TableHead className="hidden sm:table-cell font-semibold">
              Delivery
            </TableHead>
            <TableHead className="font-semibold">Amount</TableHead>
            <TableHead className="font-semibold">Payment</TableHead>
            <TableHead className="hidden md:table-cell font-semibold">
              Status
            </TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, idx) => (
            <OrderRow key={order.id.toString()} order={order} idx={idx + 1} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function OrderDashboard({ orders }: Props) {
  const [tab, setTab] = useState("all");

  const filteredOrders = orders.filter((o) => {
    if (tab === "all") return true;
    if (tab === "pending") return o.deliveryStatus === "Pending";
    if (tab === "delivered") return o.deliveryStatus === "Delivered";
    if (tab === "payment") return o.paymentStatus === "Pending";
    return true;
  });

  return (
    <div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4 bg-muted/60">
          <TabsTrigger data-ocid="dashboard.tab" value="all">
            All{" "}
            <span className="ml-1.5 text-xs opacity-70">({orders.length})</span>
          </TabsTrigger>
          <TabsTrigger data-ocid="dashboard.tab" value="pending">
            Pending
          </TabsTrigger>
          <TabsTrigger data-ocid="dashboard.tab" value="delivered">
            Delivered
          </TabsTrigger>
          <TabsTrigger data-ocid="dashboard.tab" value="payment">
            Unpaid
          </TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          <OrdersTable orders={filteredOrders} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
