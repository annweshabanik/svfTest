import { describe, it, expect } from 'vitest';
import { calculateOrder } from '../pricing';
import { initialProducts, initialPlans } from '../data';
import { CartItem } from '../types';

describe('ShopEase Pricing Engine', () => {
  const today = '2026-09-11';

  it('Test Case 1: T-Shirt x2, Mug x1, No Plan, SAVE10', () => {
    const cartItems: CartItem[] = [
      { id: 'p3', type: 'product', qty: 2 },
      { id: 'p5', type: 'product', qty: 1 },
    ];

    const result = calculateOrder({
      cartItems,
      products: initialProducts,
      plans: initialPlans,
      couponCode: 'SAVE10',
      today,
    });

    expect(result.couponDiscount).toBe(124.7);
    expect(result.deliveryFee).toBe(0);
    expect(result.total).toBe(1122.3);
    expect(result.couponError).toBeNull();
  });

  it('Test Case 2: Earbuds x1, Watch x1, Gold Plan, ELEC15', () => {
    const cartItems: CartItem[] = [
      { id: 'p1', type: 'product', qty: 1 },
      { id: 'p2', type: 'product', qty: 1 },
      { id: 'pl2', type: 'plan', qty: 1 },
    ];

    const result = calculateOrder({
      cartItems,
      products: initialProducts,
      plans: initialPlans,
      couponCode: 'ELEC15',
      today,
    });

    expect(result.membershipDiscount).toBe(379.8);
    expect(result.couponDiscount).toBe(500);
    expect(result.total).toBe(3217.2);
    expect(result.couponError).toBeNull();
  });

  it('Test Case 3: Mug x1, No Plan, FREESHIP', () => {
    const cartItems: CartItem[] = [
      { id: 'p5', type: 'product', qty: 1 },
    ];

    const result = calculateOrder({
      cartItems,
      products: initialProducts,
      plans: initialPlans,
      couponCode: 'FREESHIP',
      today,
    });

    expect(result.couponError).toContain('Add ₹50 more');
    expect(result.deliveryFee).toBe(49);
    expect(result.total).toBe(298);
  });

  it('Test Case 4: Earbuds x1, T-Shirt x1 -> remove T-Shirt, No Plan, FLAT200', () => {
    const cartBefore: CartItem[] = [
      { id: 'p1', type: 'product', qty: 1 },
      { id: 'p3', type: 'product', qty: 1 },
    ];

    const resBefore = calculateOrder({
      cartItems: cartBefore,
      products: initialProducts,
      plans: initialPlans,
      couponCode: 'FLAT200',
      today,
    });

    expect(resBefore.total).toBe(1598);

    const cartAfter: CartItem[] = [
      { id: 'p1', type: 'product', qty: 1 },
    ];

    const resAfter = calculateOrder({
      cartItems: cartAfter,
      products: initialProducts,
      plans: initialPlans,
      couponCode: 'FLAT200',
      today,
    });

    expect(resAfter.couponError).not.toBeNull();
    
    const resAfterRemovedCoupon = calculateOrder({
      cartItems: cartAfter,
      products: initialProducts,
      plans: initialPlans,
      couponCode: '',
      today,
    });

    expect(resAfterRemovedCoupon.total).toBe(1299);
  });

  it('Test Case 5: Watch x2, Platinum Plan, GOLD20', () => {
    const cartItems: CartItem[] = [
      { id: 'p2', type: 'product', qty: 2 },
      { id: 'pl3', type: 'plan', qty: 1 },
    ];

    const result = calculateOrder({
      cartItems,
      products: initialProducts,
      plans: initialPlans,
      couponCode: 'GOLD20',
      today,
    });

    expect(result.membershipDiscount).toBe(749.7);
    expect(result.couponDiscount).toBe(600);
    expect(result.total).toBe(4647.3);
    expect(result.couponError).toBeNull();
  });

  it('Test Case 6: Gold plan only, Gold Plan, ELEC15', () => {
    const cartItems: CartItem[] = [
      { id: 'pl2', type: 'plan', qty: 1 },
    ];

    const result = calculateOrder({
      cartItems,
      products: initialProducts,
      plans: initialPlans,
      couponCode: 'ELEC15',
      today,
    });

    expect(result.couponError).toBe('No eligible items in cart');
    expect(result.deliveryFee).toBe(0);
    expect(result.total).toBe(299);
  });

  it('Test Case 7: Any cart, Any plan, OLD50', () => {
    const cartItems: CartItem[] = [
      { id: 'p1', type: 'product', qty: 1 },
    ];

    const result = calculateOrder({
      cartItems,
      products: initialProducts,
      plans: initialPlans,
      couponCode: 'OLD50',
      today,
    });

    expect(result.couponError).toBe('Coupon expired');
  });
});
