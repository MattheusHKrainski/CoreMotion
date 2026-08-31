import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "TEST-dummy",
});

export type PaymentMethod = "pix" | "credit_card" | "boleto";

export type PaymentIntent = {
  orderId: number;
  amount: number;
  method: PaymentMethod;
  buyerEmail?: string;
};

export type PaymentResult = {
  id: string;
  status: string;
  method: PaymentMethod;
  pixCode?: string;
  pixQrCode?: string;
  checkoutUrl?: string;
  expiresAt?: Date;
};

export async function createPayment(intent: PaymentIntent): Promise<PaymentResult> {
  const { orderId, amount, method, buyerEmail } = intent;

  if (method === "pix") {
    const paymentClient = new Payment(mp);
    const payment: any = await paymentClient.create({
      body: {
        transaction_amount: amount,
        description: `Pedido #${orderId}`,
        payment_method_id: "pix",
        payer: {
          email: buyerEmail || "buyer@example.com",
        },
      },
    });

    const qrData = payment.point_of_interaction?.transaction_data;
    return {
      id: String(payment.id),
      status: payment.status,
      method: "pix",
      pixCode: qrData?.ticket_qr_code || "",
      pixQrCode: qrData?.qr_code_base64 || "",
      expiresAt: payment.date_of_expiration ? new Date(payment.date_of_expiration) : undefined,
    };
  }

  if (method === "credit_card" || method === "boleto") {
    const preferenceClient = new Preference(mp);
    const preference: any = await preferenceClient.create({
      body: {
        items: [
          {
            id: String(orderId),
            title: `Pedido #${orderId}`,
            quantity: 1,
            unit_price: amount,
          },
        ],
        payment_methods: {
          excluded_payment_methods: method === "credit_card" ? [{ id: "boleto" }, { id: "pix" }] : [{ id: "credit_card" }, { id: "pix" }],
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pedido/${orderId}/sucesso`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pedido/${orderId}/erro`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pedido/${orderId}/pendente`,
        },
        auto_return: "approved",
      },
    });

    return {
      id: String(preference.id),
      status: "pending",
      method,
      checkoutUrl: preference.init_point,
    };
  }

  throw new Error("Método de pagamento não suportado");
}

export async function getPaymentStatus(paymentId: string): Promise<{ status: string }> {
  const paymentClient = new Payment(mp);
  const payment: any = await paymentClient.get({ id: paymentId });
  return {
    status: payment.status,
  };
}

export function validateWebhookSignature(payload: any, signature: string): boolean {
  // Em produção, validar assinatura do webhook do Mercado Pago
  return true;
}
