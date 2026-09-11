import React, { useState } from 'react';
import { Product, Plan } from '../types';

interface FormProps {
  type: 'product' | 'plan';
  initialData?: Product | Plan | null;
  existingNames: string[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<FormProps> = ({
  type,
  initialData,
  existingNames,
  onSubmit,
  onCancel,
}) => {
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : '');
  
  const [category, setCategory] = useState((initialData as Product)?.category || 'Electronics');
  const [stock, setStock] = useState((initialData as Product)?.stock !== undefined ? String((initialData as Product).stock) : '0');

  const [durationMonths, setDurationMonths] = useState((initialData as Plan)?.durationMonths || 1);
  const [discountPercent, setDiscountPercent] = useState((initialData as Plan)?.discountPercent !== undefined ? String((initialData as Plan).discountPercent) : '0');
  const [freeDelivery, setFreeDelivery] = useState((initialData as Plan)?.freeDelivery || false);

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Name is required');
      return;
    }

    const nameLower = trimmedName.toLowerCase();
    const originalNameLower = initialData?.name.toLowerCase();
    
    if (nameLower !== originalNameLower && existingNames.map((n) => n.toLowerCase()).includes(nameLower)) {
      setError('Name must be unique');
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (type === 'product') {
      const numStock = Number(stock);
      if (isNaN(numStock) || !Number.isInteger(numStock) || numStock < 0) {
        setError('Stock must be an integer >= 0');
        return;
      }

      onSubmit({
        id: initialData?.id,
        name: trimmedName,
        category,
        price: numPrice,
        stock: numStock,
        active: initialData ? initialData.active : true,
      });
    } else {
      const numDiscount = Number(discountPercent);
      if (isNaN(numDiscount) || numDiscount < 0 || numDiscount > 30) {
        setError('Discount percent must be between 0 and 30');
        return;
      }

      onSubmit({
        id: initialData?.id,
        name: trimmedName,
        price: numPrice,
        durationMonths: Number(durationMonths),
        discountPercent: numDiscount,
        freeDelivery,
        active: initialData ? initialData.active : true,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-100 space-y-4"
      >
        <h3 className="text-lg font-bold text-gray-900">
          {isEditing ? `Edit ${type}` : `Add New ${type}`}
        </h3>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-900 focus:border-slate-900 p-2.5"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Price (₹)</label>
          <input
            type="number"
            step="any"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-900 focus:border-slate-900 p-2.5"
          />
        </div>

        {type === 'product' ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-900 focus:border-slate-900 p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-900 focus:border-slate-900 p-2.5"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Duration (Months)</label>
              <select
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-900 focus:border-slate-900 p-2.5"
              >
                <option value={1}>1 month</option>
                <option value={3}>3 months</option>
                <option value={12}>12 months</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Percent (0-30%)</label>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-900 focus:border-slate-900 p-2.5"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="freeDelivery"
                checked={freeDelivery}
                onChange={(e) => setFreeDelivery(e.target.checked)}
                className="w-4 h-4 text-slate-900 bg-gray-100 border-gray-300 rounded-sm focus:ring-slate-900"
              />
              <label htmlFor="freeDelivery" className="ml-2 text-xs font-semibold text-gray-700">
                Free Delivery
              </label>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};
