import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MessageCircleMore } from "lucide-react";
import { useEffect } from "react";
import { NewOrderModal } from "./components/NewOrderModal";
import { OrderDashboard } from "./components/OrderDashboard";
import { RemindersPanel } from "./components/RemindersPanel";
import { StatsBar } from "./components/StatsBar";
import { useActor } from "./hooks/useActor";
import { useCreateOrder, useGetOrders } from "./hooks/useQueries";

const queryClient = new QueryClient();

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function getDayAfterStr() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

const SAMPLE_ORDERS = [
  {
    customerName: "Riya",
    product: "Chocolate Cake",
    quantity: BigInt(2),
    deliveryDate: getTomorrowStr(),
    price: 800,
    paymentStatus: "Pending",
    deliveryStatus: "Pending",
  },
  {
    customerName: "Aman",
    product: "Tiffin Box",
    quantity: BigInt(5),
    deliveryDate: getTodayStr(),
    price: 600,
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
  },
  {
    customerName: "Priya",
    product: "Kurti",
    quantity: BigInt(3),
    deliveryDate: getDayAfterStr(),
    price: 1500,
    paymentStatus: "COD",
    deliveryStatus: "Out for Delivery",
  },
];

const SKELETON_STAT_KEYS = ["s1", "s2", "s3", "s4"];
const SKELETON_ROW_KEYS = ["r1", "r2", "r3"];

function AppContent() {
  const { data: orders = [], isLoading } = useGetOrders();
  const createOrder = useCreateOrder();
  const { actor, isFetching } = useActor();

  // Seed sample data on first load
  // biome-ignore lint/correctness/useExhaustiveDependencies: createOrder.mutateAsync is stable from useMutation
  useEffect(() => {
    if (!actor || isFetching || isLoading) return;
    if (orders.length > 0) return;

    const seed = async () => {
      for (const order of SAMPLE_ORDERS) {
        await createOrder.mutateAsync(order);
      }
    };
    seed();
  }, [actor, isFetching, isLoading, orders.length]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="brand-gradient sticky top-0 z-40 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <MessageCircleMore className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-display font-bold text-lg leading-none">
                OrderChat
              </h1>
              <p className="text-white/70 text-xs leading-none mt-0.5">
                WhatsApp Order Manager
              </p>
            </div>
          </div>
          <NewOrderModal />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 space-y-5">
        {/* Reminders Banner */}
        <RemindersPanel orders={orders} />

        {/* Stats */}
        {isLoading ? (
          <div
            data-ocid="stats.loading_state"
            className="grid grid-cols-2 gap-3 md:grid-cols-4"
          >
            {SKELETON_STAT_KEYS.map((k) => (
              <div
                key={k}
                className="bg-card rounded-lg shadow-card p-4 border border-border h-24 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <StatsBar orders={orders} />
        )}

        {/* Orders Section */}
        <div className="bg-card rounded-xl shadow-card border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-foreground">
              Orders
            </h2>
            {isLoading && (
              <span className="text-xs text-muted-foreground animate-pulse">
                Loading...
              </span>
            )}
          </div>

          {isLoading ? (
            <div data-ocid="dashboard.loading_state" className="space-y-3">
              {SKELETON_ROW_KEYS.map((k) => (
                <div
                  key={k}
                  className="h-12 bg-muted/40 rounded-md animate-pulse"
                />
              ))}
            </div>
          ) : (
            <OrderDashboard orders={orders} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
