# OrderChat

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Order data model: id, customerName, product, quantity, deliveryDate, price, paymentStatus (Paid/COD/Pending), deliveryStatus (Pending/Out for Delivery/Delivered), createdAt
- Backend CRUD: createOrder, getOrders, updatePaymentStatus, updateDeliveryStatus, deleteOrder
- WhatsApp message paste parser (frontend, regex-based): extract product, quantity, delivery date, price from free-text
- Order entry form with customer name field + parsed fields (editable)
- Order Dashboard: table/list view showing all orders with filters by status
- Payment status toggle: Paid / COD / Pending
- Delivery status toggle: Pending / Out for Delivery / Delivered
- Delivery reminders panel: highlight orders due today or tomorrow
- WhatsApp reply templates: Order Confirmed, Payment Reminder, Delivery Update — copy-to-clipboard buttons
- Summary stats: total orders, total revenue, pending payments count

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Define Order type and stable storage in Motoko
2. Implement CRUD endpoints: createOrder, getOrders, updatePaymentStatus, updateDeliveryStatus, deleteOrder
3. Frontend: WhatsApp message parser utility (regex for qty, price ₹, delivery date keywords)
4. Frontend: New Order modal with paste-and-parse flow + editable fields
5. Frontend: Order Dashboard table with status badges and filter tabs
6. Frontend: Payment and delivery status quick-update controls per row
7. Frontend: Delivery Reminders section (orders due today/tomorrow)
8. Frontend: WhatsApp template copy buttons per order
9. Frontend: Summary stats cards at top
