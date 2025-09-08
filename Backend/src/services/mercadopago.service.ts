import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { config } from "../config/environment";

// Configurar MercadoPago
const client = new MercadoPagoConfig({
  accessToken: config.mercadopago.accessToken,
  options: { timeout: 5000, idempotencyKey: "abc" },
});

const preference = new Preference(client);
const payment = new Payment(client);

export interface CheckoutItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
  picture_url?: string;
  description?: string;
}

export interface ShippingAddress {
  street_name: string;
  street_number?: string;
  zip_code: string;
  city_name: string;
  state_name: string;
  country_name: string;
}

export interface Payer {
  name: string;
  surname: string;
  email: string;
  phone?: {
    area_code: string;
    number: string;
  };
  identification?: {
    type: string;
    number: string;
  };
  address?: ShippingAddress;
}

export class MercadoPagoService {
  /**
   * Crear una preferencia de pago
   */
  static async createPreference(
    items: CheckoutItem[],
    payer: Payer,
    orderId: string,
    metadata?: Record<string, any>
  ) {
    try {
      const body = {
        items: items.map((item) => ({
          ...item,
          currency_id: item.currency_id || "ARS",
        })),
        payer,
        external_reference: orderId,
        notification_url: `${config.frontend.url}/api/webhooks/mercadopago`,
        back_urls: {
          success: config.frontend.successUrl,
          failure: config.frontend.failureUrl,
          pending: config.frontend.pendingUrl,
        },
        auto_return: "approved" as const,
        metadata: {
          order_id: orderId,
          ...metadata,
        },
        statement_descriptor: "LAZO STORE",
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
      };

      const response = await preference.create({ body });

      return {
        id: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
        client_id: response.client_id,
        collector_id: response.collector_id,
        operation_type: response.operation_type,
        items: response.items,
        payer: response.payer,
        back_urls: response.back_urls,
        external_reference: response.external_reference,
      };
    } catch (error) {
      console.error("Error creating MercadoPago preference:", error);
      throw new Error(`Failed to create payment preference: ${error}`);
    }
  }

  /**
   * Obtener información de un pago
   */
  static async getPaymentInfo(paymentId: string) {
    try {
      const response = await payment.get({ id: paymentId });

      return {
        id: response.id,
        status: response.status,
        status_detail: response.status_detail,
        transaction_amount: response.transaction_amount,
        currency_id: response.currency_id,
        date_created: response.date_created,
        date_approved: response.date_approved,
        external_reference: response.external_reference,
        description: response.description,
        payer: response.payer,
        payment_method: response.payment_method,
        installments: response.installments,
        transaction_details: response.transaction_details,
        charges_details: response.charges_details,
      };
    } catch (error) {
      console.error("Error getting payment info:", error);
      throw new Error(`Failed to get payment info: ${error}`);
    }
  }

  /**
   * Procesar webhook de MercadoPago
   */
  static async processWebhook(webhookData: any) {
    try {
      const { type, data } = webhookData;

      if (type === "payment") {
        const paymentInfo = await this.getPaymentInfo(data.id);

        return {
          type: "payment",
          payment: paymentInfo,
          shouldUpdateOrder: true,
        };
      }

      if (type === "merchant_order") {
        // Procesar merchant order si es necesario
        return {
          type: "merchant_order",
          data,
          shouldUpdateOrder: false,
        };
      }

      return {
        type: "unknown",
        data,
        shouldUpdateOrder: false,
      };
    } catch (error) {
      console.error("Error processing webhook:", error);
      throw new Error(`Failed to process webhook: ${error}`);
    }
  }

  /**
   * Cancelar una preferencia de pago
   */
  static async cancelPreference(preferenceId: string) {
    try {
      // MercadoPago no tiene cancelación directa de preferencias
      // pero podemos marcarla como expirada en nuestra base de datos
      console.log(`Marking preference ${preferenceId} as cancelled`);
      return { cancelled: true };
    } catch (error) {
      console.error("Error cancelling preference:", error);
      throw new Error(`Failed to cancel preference: ${error}`);
    }
  }

  /**
   * Obtener métodos de pago disponibles
   */
  static async getPaymentMethods() {
    try {
      // Esto normalmente se haría con la API de MercadoPago
      // pero para simplicidad, devolvemos los métodos más comunes en Argentina
      return {
        credit_cards: [
          {
            id: "visa",
            name: "Visa",
            secure_thumbnail:
              "https://www.mercadopago.com/org-img/MP3/API/logos/visa.gif",
          },
          {
            id: "master",
            name: "Mastercard",
            secure_thumbnail:
              "https://www.mercadopago.com/org-img/MP3/API/logos/master.gif",
          },
          {
            id: "amex",
            name: "American Express",
            secure_thumbnail:
              "https://www.mercadopago.com/org-img/MP3/API/logos/amex.gif",
          },
        ],
        debit_cards: [
          {
            id: "debvisa",
            name: "Visa Débito",
            secure_thumbnail:
              "https://www.mercadopago.com/org-img/MP3/API/logos/debvisa.gif",
          },
          {
            id: "debmaster",
            name: "Mastercard Débito",
            secure_thumbnail:
              "https://www.mercadopago.com/org-img/MP3/API/logos/debmaster.gif",
          },
        ],
        other: [
          {
            id: "rapipago",
            name: "Rapipago",
            secure_thumbnail:
              "https://www.mercadopago.com/org-img/MP3/API/logos/rapipago.gif",
          },
          {
            id: "pagofacil",
            name: "Pago Fácil",
            secure_thumbnail:
              "https://www.mercadopago.com/org-img/MP3/API/logos/pagofacil.gif",
          },
        ],
      };
    } catch (error) {
      console.error("Error getting payment methods:", error);
      throw new Error(`Failed to get payment methods: ${error}`);
    }
  }
}
