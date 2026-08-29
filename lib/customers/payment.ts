import { PAYMENT_METHODS, type PaymentMethodId } from "@/lib/customers/types";

export function paymentMethodLabel(id?: PaymentMethodId | string | null) {
  if (!id) return null;
  return PAYMENT_METHODS.find((item) => item.id === id)?.label ?? null;
}

export function parsePaymentMethod(value: unknown, required = false): PaymentMethodId | undefined {
  const id = String(value ?? "").trim();
  if (!id) {
    if (required) throw new Error("Επίλεξε τρόπο πληρωμής.");
    return undefined;
  }
  if (!PAYMENT_METHODS.some((item) => item.id === id)) {
    throw new Error("Μη έγκυρος τρόπος πληρωμής.");
  }
  return id as PaymentMethodId;
}
