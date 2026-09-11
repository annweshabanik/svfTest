export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  discountPercent: number;
  freeDelivery: boolean;
  active: boolean;
}

export interface Coupon {
  code: string;
  type: 'percent' | 'flat' | 'freeDelivery';
  value?: number;
  maxDiscount?: number;
  minOrder?: number;
  category?: string;
  requiresPlan?: string[];
  expiresAt?: string;
}

export interface CartItem {
  id: string;
  type: 'product' | 'plan';
  qty: number;
}

export interface CalculateOrderParams {
  cartItems: CartItem[];
  products: Product[];
  plans: Plan[];
  couponCode?: string;
  today?: string;
}

export interface CalculateOrderResult {
  productSubtotal: number;
  membershipDiscount: number;
  couponDiscount: number;
  deliveryFee: number;
  planPrice: number;
  total: number;
  couponError: string | null;
}
