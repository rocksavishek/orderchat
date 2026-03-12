import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Copy, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Order } from "../backend.d";

interface Props {
  order: Order;
  triggerOcid: string;
  popoverOcid: string;
}

export function WhatsAppTemplates({ order, triggerOcid, popoverOcid }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const templates = [
    {
      id: "confirmed",
      label: "Order Confirmed",
      emoji: "✅",
      text: `Hi ${order.customerName}! Your order of ${order.product} x${order.quantity} is confirmed. Expected delivery: ${order.deliveryDate}. Total: ₹${order.price}. Thank you! 🙏`,
    },
    {
      id: "reminder",
      label: "Payment Reminder",
      emoji: "💰",
      text: `Hi ${order.customerName}, just a reminder that ₹${order.price} for your ${order.product} order is pending. Please pay at the time of delivery. Thanks!`,
    },
    {
      id: "delivery",
      label: "Delivery Update",
      emoji: "🚚",
      text: `Hi ${order.customerName}! Your ${order.product} order is out for delivery today. Please keep ₹${order.price} ready. 🚚`,
    },
  ];

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          data-ocid={triggerOcid}
          className="h-8 w-8 p-0 text-primary hover:bg-accent"
          title="WhatsApp Templates"
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent data-ocid={popoverOcid} className="w-72 p-3" align="end">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4 text-primary" />
          WhatsApp Templates
        </p>
        <div className="flex flex-col gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleCopy(t.id, t.text)}
              className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>{t.emoji}</span>
                <span className="font-medium">{t.label}</span>
              </span>
              {copied === t.id ? (
                <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Click to copy and paste in WhatsApp
        </p>
      </PopoverContent>
    </Popover>
  );
}
