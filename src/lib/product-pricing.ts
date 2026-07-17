export type DiscountType = "fixed" | "percentage" | null;

export function hasActiveDiscount(
  discountType: DiscountType,
  discountValue: number,
) {
  return Boolean(discountType) && discountValue > 0;
}

export function calculateFinalPrice(
  price: number,
  discountType: DiscountType,
  discountValue: number,
) {
  if (!hasActiveDiscount(discountType, discountValue)) {
    return price;
  }

  if (discountType === "fixed") {
    return Math.max(0, price - discountValue);
  }

  if (discountType === "percentage") {
    return Math.max(0, price - (price * discountValue) / 100);
  }

  return price;
}

export function formatProductPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDiscountLabel(
  price: number,
  discountType: DiscountType,
  discountValue: number,
) {
  if (!hasActiveDiscount(discountType, discountValue)) return null;

  if (discountType === "percentage") {
    return `-${Math.round(discountValue)}%`;
  }

  if (discountType === "fixed" && price > 0) {
    return `-${Math.round((discountValue / price) * 100)}%`;
  }

  return null;
}
