import React, { useState, useEffect } from 'react';
import { Product, Plan } from '../types';

interface StoreProps {
  products: Product[];
  plans: Plan[];
  onAddToCart: (item: { id: string; type: 'product' | 'plan' }) => void;
  cartPlanId?: string;
}

export const Store: React.FC<StoreProps> = ({
  products,
  plans,
  onAddToCart,
  cartPlanId,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');

  useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const activeProducts = products.filter((p) => p.active);
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = activeProducts
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (priceSort === 'asc') return a.price - b.price;
      if (priceSort === 'desc') return b.price - a.price;
      return 0;
    });

  const activePlans = plans.filter((p) => p.active);

  const bestValuePlanId = activePlans.reduce<{ id: string; rate: number } | null>(
    (acc, p) => {
      const rate = p.price / p.durationMonths;
      if (!acc || rate < acc.rate) {
        return { id: p.id, rate };
      }
      return acc;
    },
    null
  )?.id;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-900 focus:border-slate-900 block p-2.5 pr-20"
            />
            {isSearching && (
              <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-medium">
                Searching...
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-900 focus:border-slate-900 block p-2.5"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>

            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value as any)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-900 focus:border-slate-900 block p-2.5"
            >
              <option value="none">Sort: Default</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-4">Products</h3>
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
            No products match your search or filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900 text-base">{p.name}</h4>
                    <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                      {p.category}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-1">₹{p.price}</div>
                  <div className="text-xs text-gray-500 mb-4">
                    Stock available: <span className="font-medium text-gray-700">{p.stock}</span>
                  </div>
                </div>

                {p.stock > 0 ? (
                  <button
                    onClick={() => onAddToCart({ id: p.id, type: 'product' })}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-2 px-4 rounded-lg transition-colors cursor-pointer"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-400 font-medium text-sm py-2 px-4 rounded-lg cursor-not-allowed"
                  >
                    Out of stock
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Membership Plans</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {activePlans.map((p) => {
            const isBestValue = p.id === bestValuePlanId;
            const isSelected = p.id === cartPlanId;

            return (
              <div
                key={p.id}
                className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between relative transition-all ${
                  isBestValue ? 'border-amber-400 ring-1 ring-amber-400' : 'border-gray-200'
                }`}
              >
                {isBestValue && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full absolute -top-3 right-4 shadow-2xs">
                    Best Value
                  </span>
                )}
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">{p.name}</h4>
                  <div className="text-2xl font-extrabold text-gray-900 mb-3">
                    ₹{p.price}{' '}
                    <span className="text-xs font-normal text-gray-500">
                      / {p.durationMonths} {p.durationMonths === 1 ? 'month' : 'months'}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-gray-600 mb-6">
                    <li className="flex items-center gap-1.5">
                      <span className="text-emerald-500 font-bold">✓</span>
                      {p.discountPercent}% off on products
                    </li>
                    {p.freeDelivery && (
                      <li className="flex items-center gap-1.5">
                        <span className="text-emerald-500 font-bold">✓</span>
                        Free delivery on orders
                      </li>
                    )}
                  </ul>
                </div>

                <button
                  onClick={() => onAddToCart({ id: p.id, type: 'plan' })}
                  className={`w-full font-medium text-sm py-2 px-4 rounded-lg transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'border border-slate-900 text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {isSelected ? 'Selected (Click to Replace)' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
