import React, { useState } from 'react';
import { Product, Plan, CartItem, CalculateOrderResult } from '../types';

interface CartProps {
  cartItems: CartItem[];
  products: Product[];
  plans: Plan[];
  couponCode: string;
  onApplyCoupon: (code: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
  onRemoveItem: (id: string, type: 'product' | 'plan') => void;
  orderSummary: CalculateOrderResult;
  noticeMessage: string | null;
}

export const Cart: React.FC<CartProps> = ({
  cartItems,
  products,
  plans,
  couponCode,
  onApplyCoupon,
  onUpdateQty,
  onRemoveItem,
  orderSummary,
  noticeMessage,
}) => {
  const [inputCoupon, setInputCoupon] = useState(couponCode);

  const productMap = new Map(products.map((p) => [p.id, p]));
  const planMap = new Map(plans.map((p) => [p.id, p]));

  let hasUnavailableItems = false;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyCoupon(inputCoupon);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs sticky top-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center justify-between">
        <span>Cart</span>
        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
        </span>
      </h2>

      {noticeMessage && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-lg mb-4 leading-relaxed">
          {noticeMessage}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          Your cart is currently empty.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="divide-y divide-gray-100">
            {cartItems.map((item) => {
              if (item.type === 'product') {
                const prod = productMap.get(item.id);
                const isUnavailable = !prod || !prod.active;
                if (isUnavailable) hasUnavailableItems = true;

                return (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className={`font-medium text-sm truncate ${isUnavailable ? 'text-red-600 line-through' : 'text-gray-900'}`}>
                        {prod ? prod.name : 'Unknown Product'}
                      </div>
                      {isUnavailable ? (
                        <span className="text-xs font-bold text-red-600">(Unavailable)</span>
                      ) : (
                        <div className="text-xs text-gray-500">₹{prod.price} each</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isUnavailable && prod && (
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <button
                            onClick={() => onUpdateQty(item.id, item.qty - 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 text-sm font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-gray-900">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => onUpdateQty(item.id, item.qty + 1)}
                            disabled={item.qty >= prod.stock}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 text-sm font-bold disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => onRemoveItem(item.id, 'product')}
                        className="text-gray-400 hover:text-red-600 text-xs font-medium px-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              } else {
                const plan = planMap.get(item.id);
                const isUnavailable = !plan || !plan.active;
                if (isUnavailable) hasUnavailableItems = true;

                return (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className={`font-semibold text-sm ${isUnavailable ? 'text-red-600 line-through' : 'text-gray-900'}`}>
                        Plan: {plan ? plan.name : 'Unknown Plan'}
                      </div>
                      {isUnavailable ? (
                        <span className="text-xs font-bold text-red-600">(Unavailable)</span>
                      ) : (
                        <div className="text-xs text-gray-500">₹{plan.price}</div>
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => onRemoveItem(item.id, 'plan')}
                        className="text-gray-400 hover:text-red-600 text-xs font-medium px-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              }
            })}
          </div>

          <form onSubmit={handleApply} className="pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Coupon code"
                value={inputCoupon}
                onChange={(e) => setInputCoupon(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-slate-900 focus:border-slate-900 px-3 py-2 uppercase"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
            {orderSummary.couponError && (
              <p className="text-red-600 text-xs mt-1.5 font-medium">{orderSummary.couponError}</p>
            )}
          </form>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Product Subtotal</span>
              <span className="font-medium text-gray-900">₹{orderSummary.productSubtotal.toFixed(2)}</span>
            </div>
            {orderSummary.membershipDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Membership Discount</span>
                <span>-₹{orderSummary.membershipDiscount.toFixed(2)}</span>
              </div>
            )}
            {orderSummary.couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Coupon Discount</span>
                <span>-₹{orderSummary.couponDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-medium text-gray-900">
                {orderSummary.deliveryFee === 0 ? 'FREE' : `₹${orderSummary.deliveryFee.toFixed(2)}`}
              </span>
            </div>
            {orderSummary.planPrice > 0 && (
              <div className="flex justify-between">
                <span>Plan Price</span>
                <span className="font-medium text-gray-900">₹{orderSummary.planPrice.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline text-gray-900">
              <span className="text-sm font-bold">Total</span>
              <span className="text-xl font-extrabold">₹{orderSummary.total.toFixed(2)}</span>
            </div>

            <button
              disabled={hasUnavailableItems}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-xs transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed mt-2 cursor-pointer"
            >
              Checkout
            </button>
            {hasUnavailableItems && (
              <p className="text-red-600 text-[11px] text-center font-medium">
                Remove unavailable items before checking out.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
