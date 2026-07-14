export type PaymentOrder = { id: string; amount: number; currency: string };

export interface ISubscriptionPaymentGateway {
  createOrder(amount: number, receipt: string): Promise<PaymentOrder>;
  verifySignature(orderId: string, paymentId: string, signature: string): boolean;
  getPublicKey(): string;
}
