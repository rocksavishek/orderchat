import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateOrder } from "../hooks/useQueries";
import { parseWhatsAppMessage } from "../utils/parseWhatsApp";

const defaultForm = {
  customerName: "",
  product: "",
  quantity: "1",
  deliveryDate: new Date().toISOString().split("T")[0],
  price: "",
  paymentStatus: "Pending",
  deliveryStatus: "Pending",
};

export function NewOrderModal() {
  const [open, setOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [form, setForm] = useState(defaultForm);
  const createOrder = useCreateOrder();

  const handleParse = () => {
    if (!pasteText.trim()) {
      toast.error("Please paste a WhatsApp message first");
      return;
    }
    const parsed = parseWhatsAppMessage(pasteText);
    setForm((prev) => ({
      ...prev,
      customerName: parsed.customerName || prev.customerName,
      product: parsed.product || prev.product,
      quantity: String(parsed.quantity || 1),
      deliveryDate: parsed.deliveryDate || prev.deliveryDate,
      price: parsed.price ? String(parsed.price) : prev.price,
    }));
    toast.success("Message parsed! Review and edit the fields below.");
  };

  const handleSubmit = async () => {
    if (!form.customerName.trim() || !form.product.trim()) {
      toast.error("Customer name and product are required");
      return;
    }
    try {
      await createOrder.mutateAsync({
        customerName: form.customerName.trim(),
        product: form.product.trim(),
        quantity: BigInt(Number.parseInt(form.quantity) || 1),
        deliveryDate: form.deliveryDate,
        price: Number.parseFloat(form.price) || 0,
        paymentStatus: form.paymentStatus,
        deliveryStatus: form.deliveryStatus,
      });
      toast.success(`Order for ${form.customerName} created! ✅`);
      setOpen(false);
      setForm(defaultForm);
      setPasteText("");
    } catch {
      toast.error("Failed to create order");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-ocid="order.open_modal_button" className="gap-2">
          <Plus className="w-4 h-4" />
          New Order
        </Button>
      </DialogTrigger>
      <DialogContent
        data-ocid="order.dialog"
        className="max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Add New Order
          </DialogTitle>
        </DialogHeader>

        {/* WhatsApp Paste Section */}
        <div className="rounded-lg bg-accent p-3 space-y-2">
          <Label className="text-xs font-semibold text-accent-foreground uppercase tracking-wide">
            📱 Paste WhatsApp Message (optional)
          </Label>
          <Textarea
            data-ocid="order.textarea"
            placeholder='e.g. "2 cakes, delivery tomorrow, ₹800 - Riya"'
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            className="min-h-[72px] text-sm resize-none bg-card"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            data-ocid="order.parse_button"
            onClick={handleParse}
            className="gap-1.5 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Auto-Fill from Message
          </Button>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label htmlFor="customerName" className="text-sm">
              Customer Name *
            </Label>
            <Input
              id="customerName"
              data-ocid="order.customer_input"
              placeholder="Riya Sharma"
              value={form.customerName}
              onChange={(e) =>
                setForm((p) => ({ ...p, customerName: e.target.value }))
              }
            />
          </div>

          <div className="col-span-2 space-y-1">
            <Label htmlFor="product" className="text-sm">
              Product *
            </Label>
            <Input
              id="product"
              data-ocid="order.product_input"
              placeholder="Chocolate Cake"
              value={form.product}
              onChange={(e) =>
                setForm((p) => ({ ...p, product: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="quantity" className="text-sm">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              data-ocid="order.qty_input"
              value={form.quantity}
              onChange={(e) =>
                setForm((p) => ({ ...p, quantity: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="price" className="text-sm">
              Price (₹)
            </Label>
            <Input
              id="price"
              type="number"
              min="0"
              data-ocid="order.price_input"
              placeholder="800"
              value={form.price}
              onChange={(e) =>
                setForm((p) => ({ ...p, price: e.target.value }))
              }
            />
          </div>

          <div className="col-span-2 space-y-1">
            <Label htmlFor="deliveryDate" className="text-sm">
              Delivery Date
            </Label>
            <Input
              id="deliveryDate"
              type="date"
              data-ocid="order.date_input"
              value={form.deliveryDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, deliveryDate: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label className="text-sm">Payment Status</Label>
            <Select
              value={form.paymentStatus}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, paymentStatus: v }))
              }
            >
              <SelectTrigger data-ocid="order.payment_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="COD">COD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm">Delivery Status</Label>
            <Select
              value={form.deliveryStatus}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, deliveryStatus: v }))
              }
            >
              <SelectTrigger data-ocid="order.delivery_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Out for Delivery">
                  Out for Delivery
                </SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          data-ocid="order.submit_button"
          onClick={handleSubmit}
          disabled={createOrder.isPending}
          className="w-full gap-2"
        >
          {createOrder.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {createOrder.isPending ? "Creating..." : "Create Order"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
