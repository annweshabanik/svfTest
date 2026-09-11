import React, { useState, useEffect } from 'react';
import { Product, Plan, CartItem } from './types';
import { initialProducts, initialPlans } from './data';
import { calculateOrder } from './pricing';
import { Store } from './components/Store';
import { Cart } from './components/Cart';
import { Admin } from './components/Admin';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('shopease_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [plans, setPlans] = useState<Plan[]>(() => {
    const saved = localStorage.getItem('shopease_plans');
    return saved ? JSON.parse(saved) : initialPlans;
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('shopease_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [couponCode, setCouponCode] = useState<string>(() => {
    return localStorage.getItem('shopease_coupon') || '';
  });

  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('shopease_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('shopease_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('shopease_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('shopease_coupon', couponCode);
  }, [couponCode]);

  useEffect(() => {
    const prodMap = new Map(products.map((p) => [p.id, p]));
    let stockClamped = false;
    let clampedNotice = '';

    const newCart = cartItems.map((item) => {
      if (item.type === 'product') {
        const prod = prodMap.get(item.id);
        if (prod && item.qty > prod.stock) {
          stockClamped = true;
          clampedNotice = `Stock for "${prod.name}" was reduced. Cart quantity adjusted to ${prod.stock}.`;
          return { ...item, qty: prod.stock };
        }
      }
      return item;
    }).filter((item) => item.qty > 0);

    if (stockClamped) {
      setCartItems(newCart);
      setNoticeMessage(clampedNotice);
    }
  }, [products]);

  const orderSummary = calculateOrder({
    cartItems,
    products,
    plans,
    couponCode,
  });

  useEffect(() => {
    if (couponCode && orderSummary.couponError) {
      setNoticeMessage(`Coupon "${couponCode}" auto-removed: ${orderSummary.couponError}`);
      setCouponCode('');
    }
  }, [cartItems, products, plans, couponCode, orderSummary.couponError]);

  const handleAddToCart = (itemToAdd: { id: string; type: 'product' | 'plan' }) => {
    setNoticeMessage(null);

    if (itemToAdd.type === 'product') {
      const prod = products.find((p) => p.id === itemToAdd.id);
      if (!prod || prod.stock <= 0 || !prod.active) return;

      setCartItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.type === 'product' && i.id === itemToAdd.id);
        if (existingIndex > -1) {
          const currentQty = prev[existingIndex].qty;
          if (currentQty >= prod.stock) return prev;
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], qty: currentQty + 1 };
          return updated;
        } else {
          return [...prev, { id: itemToAdd.id, type: 'product', qty: 1 }];
        }
      });
    } else {
      const newPlan = plans.find((p) => p.id === itemToAdd.id);
      if (!newPlan || !newPlan.active) return;

      const existingPlanItem = cartItems.find((i) => i.type === 'plan');
      if (existingPlanItem) {
        if (existingPlanItem.id === itemToAdd.id) return;
        const oldPlan = plans.find((p) => p.id === existingPlanItem.id);
        const oldName = oldPlan ? oldPlan.name : 'previous plan';
        setNoticeMessage(`${newPlan.name} replaced ${oldName}`);

        setCartItems((prev) => [
          ...prev.filter((i) => i.type !== 'plan'),
          { id: itemToAdd.id, type: 'plan', qty: 1 },
        ]);
      } else {
        setCartItems((prev) => [...prev, { id: itemToAdd.id, type: 'plan', qty: 1 }]);
      }
    }
  };

  const handleUpdateQty = (id: string, newQty: number) => {
    setNoticeMessage(null);
    if (newQty <= 0) {
      handleRemoveCartItem(id, 'product');
      return;
    }

    const prod = products.find((p) => p.id === id);
    const maxStock = prod ? prod.stock : 999;
    const qtyToSet = Math.min(newQty, maxStock);

    setCartItems((prev) =>
      prev.map((i) => (i.type === 'product' && i.id === id ? { ...i, qty: qtyToSet } : i))
    );
  };

  const handleRemoveCartItem = (id: string, type: 'product' | 'plan') => {
    setNoticeMessage(null);
    setCartItems((prev) => prev.filter((i) => !(i.type === type && i.id === id)));
  };

  const handleSaveProduct = (prod: Product) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === prod.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = prod;
        return updated;
      } else {
        return [...prev, prod];
      }
    });
  };

  const handleSavePlan = (plan: Plan) => {
    setPlans((prev) => {
      const idx = prev.findIndex((p) => p.id === plan.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = plan;
        return updated;
      } else {
        return [...prev, plan];
      }
    });
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDeletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const handleToggleProductActive = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const handleTogglePlanActive = (id: string) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const cartPlanItem = cartItems.find((i) => i.type === 'plan');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-lg">
              S
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">ShopEase</span>
          </div>

          <nav className="flex space-x-2">
            <button
              onClick={() => setCurrentView('store')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                currentView === 'store'
                  ? 'bg-slate-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Store
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-slate-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Admin Panel
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div
          className={`grid gap-8 ${
            currentView === 'store' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'
          }`}
        >
          <div className={currentView === 'store' ? 'lg:col-span-2' : ''}>
            {currentView === 'store' ? (
              <Store
                products={products}
                plans={plans}
                onAddToCart={handleAddToCart}
                cartPlanId={cartPlanItem?.id}
              />
            ) : (
              <Admin
                products={products}
                plans={plans}
                cartItems={cartItems}
                onSaveProduct={handleSaveProduct}
                onSavePlan={handleSavePlan}
                onDeleteProduct={handleDeleteProduct}
                onDeletePlan={handleDeletePlan}
                onToggleProductActive={handleToggleProductActive}
                onTogglePlanActive={handleTogglePlanActive}
              />
            )}
          </div>

          {currentView === 'store' && (
            <div>
              <Cart
                cartItems={cartItems}
                products={products}
                plans={plans}
                couponCode={couponCode}
                onApplyCoupon={(code) => {
                  setNoticeMessage(null);
                  setCouponCode(code);
                }}
                onUpdateQty={handleUpdateQty}
                onRemoveItem={handleRemoveCartItem}
                orderSummary={orderSummary}
                noticeMessage={noticeMessage}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
