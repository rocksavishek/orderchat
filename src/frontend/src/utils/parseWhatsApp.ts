export interface ParsedOrder {
  customerName: string;
  product: string;
  quantity: number;
  deliveryDate: string;
  price: number;
}

function getNextDayOfWeek(dayName: string): string {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const targetDay = days.indexOf(dayName.toLowerCase());
  if (targetDay === -1) return "";
  const today = new Date();
  const todayDay = today.getDay();
  let daysUntil = targetDay - todayDay;
  if (daysUntil <= 0) daysUntil += 7;
  const result = new Date(today);
  result.setDate(today.getDate() + daysUntil);
  return result.toISOString().split("T")[0];
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function parseWhatsAppMessage(message: string): ParsedOrder {
  const text = message.trim();
  let remaining = text;
  let customerName = "";
  let product = "";
  let quantity = 1;
  let deliveryDate = "";
  let price = 0;

  // Extract price: ₹ followed by number, or Rs/rs followed by number
  const priceMatch = text.match(/(?:₹|rs\.?\s*)(\d+(?:,\d+)?(?:\.\d+)?)/i);
  if (priceMatch) {
    price = Number.parseFloat(priceMatch[1].replace(/,/g, ""));
    remaining = remaining.replace(priceMatch[0], "");
  }

  // Extract customer name: after dash "-" or after "from"
  const nameFromDash = text.match(
    /[-–]\s*([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)\s*$/,
  );
  const nameFromKeyword = text.match(
    /\bfrom\s+([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)/i,
  );
  if (nameFromDash) {
    customerName = nameFromDash[1].trim();
    remaining = remaining.replace(nameFromDash[0], "");
  } else if (nameFromKeyword) {
    customerName = nameFromKeyword[1].trim();
    remaining = remaining.replace(nameFromKeyword[0], "");
  }

  // Extract delivery date
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  if (/\btoday\b/i.test(text)) {
    deliveryDate = formatDate(today);
    remaining = remaining.replace(/\btoday\b/gi, "");
  } else if (/\btomorrow\b/i.test(text)) {
    deliveryDate = formatDate(tomorrow);
    remaining = remaining.replace(/\btomorrow\b/gi, "");
  } else if (/\bday after tomorrow\b/i.test(text)) {
    deliveryDate = formatDate(dayAfter);
    remaining = remaining.replace(/\bday after tomorrow\b/gi, "");
  } else {
    // Try day names
    const dayMatch = text.match(
      /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    );
    if (dayMatch) {
      deliveryDate = getNextDayOfWeek(dayMatch[1]);
      remaining = remaining.replace(dayMatch[0], "");
    } else {
      // Try DD/MM or DD-MM patterns
      const dateMatch = text.match(/(\d{1,2})[\/-](\d{1,2})/);
      if (dateMatch) {
        const year = today.getFullYear();
        const month = Number.parseInt(dateMatch[2]) - 1;
        const day = Number.parseInt(dateMatch[1]);
        const d = new Date(year, month, day);
        deliveryDate = formatDate(d);
        remaining = remaining.replace(dateMatch[0], "");
      }
    }
  }

  // Extract quantity + product: leading number before product
  const qtyProductMatch = remaining.match(
    /^[,\s]*([1-9]\d*)\s+([a-zA-Z][\w\s]*?)(?=[,₹\-]|$)/i,
  );
  if (qtyProductMatch) {
    quantity = Number.parseInt(qtyProductMatch[1]);
    product = qtyProductMatch[2].trim().replace(/,\s*$/, "");
    remaining = remaining.replace(qtyProductMatch[0], "");
  } else {
    // Try to extract product as first noun phrase
    const cleanRemaining = remaining.replace(/[,₹\-]/g, " ").trim();
    const words = cleanRemaining.split(/\s+/).filter(Boolean);
    const productWords: string[] = [];
    for (const word of words) {
      if (/^\d+$/.test(word)) {
        if (productWords.length === 0) {
          quantity = Number.parseInt(word);
        } else {
          break;
        }
      } else if (/^[a-zA-Z]/.test(word)) {
        productWords.push(word);
        if (productWords.length >= 3) break;
      }
    }
    product = productWords.join(" ");
  }

  // Fallback: if delivery date empty, try to find one more broadly
  if (!deliveryDate) {
    deliveryDate = formatDate(today);
  }

  return {
    customerName: customerName || "",
    product: product || "",
    quantity: quantity || 1,
    deliveryDate,
    price: price || 0,
  };
}
