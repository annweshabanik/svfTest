import React, { useState, useEffect } from 'react';
import { Product, Plan, CartItem } from '../types';
import { ProductForm } from './ProductForm';

interface AdminProps {
  products: Product[];
  plans: Plan[];
  cartItems: CartItem[];
  onSaveProduct: (product: Product) => void;
  onSavePlan: (plan: Plan) => void;
  onDeleteProduct: (id: string) => void;
  onDeletePlan: (id: string) => void;
  onToggleProductActive: (id: string) => void;
  onTogglePlanActive: (id: string) => void;
}

export const Admin: React.FC<AdminProps> = ({
  products,
  plans,
  cartItems,
  onSaveProduct,
  onSavePlan,
  onDeleteProduct,
  onDeletePlan,
  onToggleProductActive,
  onTogglePlanActive,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'plans'>('products');
  
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'product' | 'plan';
    initialData: Product | Plan | null;
  }>({
    isOpen: false,
    type: 'product',
    initialData: null,
  });

  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, activeTab]);

  const filteredProducts = products.filter((p) => {
    const query = debouncedSearch.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Active'
        ? p.active
        : !p.active;
    return matchesSearch && matchesStatus;
  });

  const filteredPlans = plans.filter((p) => {
    const query = debouncedSearch.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Active'
        ? p.active
        : !p.active;
    return matchesSearch && matchesStatus;
  });

  const totalItems = activeTab === 'products' ? filteredProducts.length : filteredPlans.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  const paginatedPlans = filteredPlans.slice(startIndex, startIndex + itemsPerPage);

  const handleDeleteProduct = (p: Product) => {
    setAdminNotice(null);
    const isInCart = cartItems.some((item) => item.type === 'product' && item.id === p.id);
    if (isInCart) {
      setAdminNotice(`Cannot delete "${p.name}" because it is currently in the cart.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete product "${p.name}"?`)) {
      onDeleteProduct(p.id);
    }
  };

  const handleDeletePlan = (pl: Plan) => {
    setAdminNotice(null);
    const isInCart = cartItems.some((item) => item.type === 'plan' && item.id === pl.id);
    if (isInCart) {
      setAdminNotice(`Cannot delete plan "${pl.name}" because it is currently in the cart.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete plan "${pl.name}"?`)) {
      onDeletePlan(pl.id);
    }
  };

  const openAddModal = () => {
    setAdminNotice(null);
    setModalState({
      isOpen: true,
      type: activeTab === 'products' ? 'product' : 'plan',
      initialData: null,
    });
  };

  const openEditModal = (item: Product | Plan) => {
    setAdminNotice(null);
    setModalState({
      isOpen: true,
      type: activeTab === 'products' ? 'product' : 'plan',
      initialData: item,
    });
  };

  const handleFormSubmit = (data: any) => {
    if (modalState.type === 'product') {
      const id = data.id || `p_${Date.now()}`;
      onSaveProduct({ ...data, id });
    } else {
      const id = data.id || `pl_${Date.now()}`;
      onSavePlan({ ...data, id });
    }
    setModalState({ isOpen: false, type: 'product', initialData: null });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Admin Management</h2>
        
        <div className="inline-flex p-1 bg-gray-100 rounded-lg space-x-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'products' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'plans' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Plans
          </button>
        </div>
      </div>

      {adminNotice && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg mb-4 font-medium">
          {adminNotice}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={activeTab === 'products' ? 'Search name or category...' : 'Search plan name...'}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-900 focus:border-slate-900 p-2.5 pr-20"
            />
            {isSearching && (
              <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-medium">
                Searching...
              </span>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-900 focus:border-slate-900 p-2.5"
          >
            <option value="All">Status: All</option>
            <option value="Active">Status: Active</option>
            <option value="Inactive">Status: Inactive</option>
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          + Add {activeTab === 'products' ? 'Product' : 'Plan'}
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        {activeTab === 'products' ? (
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No products found
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium text-gray-900">{p.name}</td>
                    <td className="py-3 px-4 text-gray-600">{p.category}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">₹{p.price}</td>
                    <td className="py-3 px-4 text-gray-600">{p.stock}</td>
                    <td className="py-3 px-4">
                      {p.active ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="text-slate-600 hover:text-slate-900 text-xs font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onToggleProductActive(p.id)}
                        className="text-amber-600 hover:text-amber-800 text-xs font-medium cursor-pointer"
                      >
                        {p.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Free Delivery</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginatedPlans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No plans found
                  </td>
                </tr>
              ) : (
                paginatedPlans.map((pl) => (
                  <tr key={pl.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium text-gray-900">{pl.name}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">₹{pl.price}</td>
                    <td className="py-3 px-4 text-gray-600">{pl.durationMonths}m</td>
                    <td className="py-3 px-4 text-gray-600">{pl.discountPercent}%</td>
                    <td className="py-3 px-4 text-gray-600">{pl.freeDelivery ? 'Yes' : 'No'}</td>
                    <td className="py-3 px-4">
                      {pl.active ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(pl)}
                        className="text-slate-600 hover:text-slate-900 text-xs font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onTogglePlanActive(pl.id)}
                        className="text-amber-600 hover:text-amber-800 text-xs font-medium cursor-pointer"
                      >
                        {pl.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeletePlan(pl)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
          <div>
            Page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-gray-700 disabled:opacity-40 disabled:hover:bg-gray-100 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-gray-700 disabled:opacity-40 disabled:hover:bg-gray-100 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {modalState.isOpen && (
        <ProductForm
          type={modalState.type}
          initialData={modalState.initialData}
          existingNames={
            modalState.type === 'product'
              ? products.map((p) => p.name)
              : plans.map((p) => p.name)
          }
          onSubmit={handleFormSubmit}
          onCancel={() => setModalState({ isOpen: false, type: 'product', initialData: null })}
        />
      )}
    </div>
  );
};
