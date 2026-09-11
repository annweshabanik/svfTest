import { Product, Plan, Coupon } from './types';

export const initialProducts: Product[] = [
  { id: "p1", name: "Wireless Earbuds", category: "Electronics", price: 1299, stock: 5, active: true },
  { id: "p2", name: "Smart Watch", category: "Electronics", price: 2499, stock: 2, active: true },
  { id: "p3", name: "Cotton T-Shirt", category: "Fashion", price: 499, stock: 10, active: true },
  { id: "p4", name: "Running Shoes", category: "Fashion", price: 1899, stock: 0, active: true },
  { id: "p5", name: "Coffee Mug", category: "Home", price: 249, stock: 20, active: true },
  { id: "p6", name: "Desk Lamp", category: "Home", price: 899, stock: 3, active: false },
];

export const initialPlans: Plan[] = [
  { id: "pl1", name: "Basic", price: 99, durationMonths: 1, discountPercent: 5, freeDelivery: false, active: true },
  { id: "pl2", name: "Gold", price: 299, durationMonths: 3, discountPercent: 10, freeDelivery: true, active: true },
  { id: "pl3", name: "Platinum", price: 999, durationMonths: 12, discountPercent: 15, freeDelivery: true, active: true },
];

export const coupons: Coupon[] = [
  { code: "SAVE10", type: "percent", value: 10, maxDiscount: 300, minOrder: 999 },
  { code: "FLAT200", type: "flat", value: 200, minOrder: 1499 },
  { code: "ELEC15", type: "percent", value: 15, maxDiscount: 500, minOrder: 0, category: "Electronics" },
  { code: "FREESHIP", type: "freeDelivery", minOrder: 299 },
  { code: "GOLD20", type: "percent", value: 20, maxDiscount: 600, minOrder: 0, requiresPlan: ["pl2", "pl3"] },
  { code: "OLD50", type: "flat", value: 50, minOrder: 0, expiresAt: "2025-12-31" },
];
