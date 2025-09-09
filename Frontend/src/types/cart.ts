import { Product, Size, Color } from "./product";

export interface CartItem {
  product_variant_id: string;
  id: string;
  product: Product;
  size: Size;
  color: Color;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemsCount: number;
}

export interface CartState extends Cart {
  addItem: (
    product: Product,
    size: Size,
    color: Color,
    quantity?: number
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemTotal: (itemId: string) => number;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
}

export interface CheckoutData {
  shipping_address: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billing_address?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  shipping_option: ShippingOption;
  payment_method: "mercadopago";
  use_same_address: boolean;
}

export interface PaymentResult {
  success: boolean;
  payment_id?: string;
  error?: string;
  redirect_url?: string;
}
