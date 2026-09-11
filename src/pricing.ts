import { CalculateOrderParams, CalculateOrderResult } from './types';
import { coupons } from './data';

const round = (num: number): number => Math.round(num * 100) / 100;

export function calculateOrder({
  cartItems,
  products,
  plans,
  couponCode,
  today = '2026-09-11',
}: CalculateOrderParams): CalculateOrderResult {
  const activeProductsMap = new Map(
    products.filter((p) => p.active).map((p) => [p.id, p])
  );
  const activePlansMap = new Map(
    plans.filter((p) => p.active).map((p) => [p.id, p])
  );

  let productSubtotal = 0;
  let categorySubtotals: Record<string, number> = {};
  let hasProductsInCart = false;

  for (const item of cartItems) {
    if (item.type === 'product') {
      const prod = activeProductsMap.get(item.id);
      if (prod) {
        hasProductsInCart = true;
        const itemTotal = prod.price * item.qty;
        productSubtotal += itemTotal;
        categorySubtotals[prod.category] =
          (categorySubtotals[prod.category] || 0) + itemTotal;
      }
    }
  }

  productSubtotal = round(productSubtotal);

  const planItem = cartItems.find((item) => item.type === 'plan');
  const activePlan = planItem ? activePlansMap.get(planItem.id) : undefined;
  const planPrice = activePlan ? activePlan.price : 0;

  let membershipDiscount = 0;
  if (activePlan && activePlan.discountPercent > 0) {
    membershipDiscount = round(
      (productSubtotal * activePlan.discountPercent) / 100
    );
  }

  const productSubtotalAfterMembership = round(
    productSubtotal - membershipDiscount
  );

  let couponDiscount = 0;
  let couponError: string | null = null;
  let couponProvidesFreeDelivery = false;

  if (couponCode && couponCode.trim() !== '') {
    const cleanCode = couponCode.trim().toUpperCase();
    const coupon = coupons.find((c) => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      couponError = 'Invalid coupon';
    } else if (coupon.expiresAt && today > coupon.expiresAt) {
      couponError = 'Coupon expired';
    } else if (
      coupon.requiresPlan &&
      (!activePlan || !coupon.requiresPlan.includes(activePlan.id))
    ) {
      couponError = 'Requires Gold or Platinum plan';
    } else {
      let eligibleAmount = 0;

      if (coupon.category) {
        const catSubtotal = categorySubtotals[coupon.category] || 0;
        if (catSubtotal === 0) {
          couponError = 'No eligible items in cart';
        } else {
          const catRatio = productSubtotal > 0 ? catSubtotal / productSubtotal : 0;
          const catMembershipDiscount = membershipDiscount * catRatio;
          eligibleAmount = round(catSubtotal - catMembershipDiscount);
        }
      } else {
        if (!hasProductsInCart) {
          couponError = 'No eligible items in cart';
        } else {
          eligibleAmount = productSubtotalAfterMembership;
        }
      }

      if (!couponError && coupon.minOrder !== undefined) {
        if (productSubtotalAfterMembership < coupon.minOrder) {
          const shortfall = round(coupon.minOrder - productSubtotalAfterMembership);
          const formattedShortfall = Number.isInteger(shortfall)
            ? shortfall.toString()
            : shortfall.toFixed(2);
          couponError = `Add ₹${formattedShortfall} more to use this coupon`;
        }
      }

      if (!couponError) {
        if (coupon.type === 'percent') {
          const rawDiscount = (eligibleAmount * (coupon.value || 0)) / 100;
          couponDiscount = round(
            coupon.maxDiscount !== undefined
              ? Math.min(rawDiscount, coupon.maxDiscount)
              : rawDiscount
          );
        } else if (coupon.type === 'flat') {
          couponDiscount = round(Math.min(coupon.value || 0, eligibleAmount));
        } else if (coupon.type === 'freeDelivery') {
          couponDiscount = 0;
          couponProvidesFreeDelivery = true;
        }
      }
    }
  }

  const productAmountAfterDiscounts = round(
    productSubtotalAfterMembership - couponDiscount
  );

  let deliveryFee = 0;
  if (hasProductsInCart) {
    const isFreeDelivery =
      (activePlan && activePlan.freeDelivery) ||
      couponProvidesFreeDelivery ||
      productAmountAfterDiscounts >= 499;

    deliveryFee = isFreeDelivery ? 0 : 49;
  } else {
    deliveryFee = 0;
  }

  const total = round(
    Math.max(
      0,
      productSubtotalAfterMembership - couponDiscount + deliveryFee + planPrice
    )
  );

  return {
    productSubtotal,
    membershipDiscount,
    couponDiscount,
    deliveryFee,
    planPrice,
    total,
    couponError,
  };
}
