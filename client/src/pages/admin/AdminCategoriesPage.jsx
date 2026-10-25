import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FolderTree, Plus, Edit3, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/geo';
import toast from 'react-hot-toast';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 500,
    perKmRate: 0,
    icon: 'Wrench',
    isActive: true,
  });

  const fetchCategories = async () => {
    try {
      const res = await api.get('/services?all=true');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      basePrice: 499,
      perKmRate: 0,
      icon: 'Wrench',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description,
      basePrice: cat.basePrice,
      perKmRate: cat.perKmRate || 0,
      icon: cat.icon || 'Wrench',
      isActive: cat.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const res = await api.patch(`/services/${editingCategory._id}`, formData);
        if (res.data.success) {
          toast.success('Category updated');
          fetchCategories();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/services', formData);
        if (res.data.success) {
          toast.success('Category created');
          fetchCategories();
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      const res = await api.patch(`/services/${cat._id}`, { isActive: !cat.isActive });
      if (res.data.success) {
        toast.success(`Category ${!cat.isActive ? 'Activated' : 'Deactivated'}`);
        fetchCategories();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900">Service Category Management</h1>
          <p className="text-xs text-slate-500">Configure standardized service rates, mileage rates, and active states</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service Category</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className={`p-6 rounded-2xl border bg-white shadow-xs flex flex-col justify-between space-y-4 transition ${
                cat.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                    {cat.slug}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(cat)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                      cat.isActive
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {cat.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
                <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{cat.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400">Base Price / Per KM</p>
                  <p className="text-sm font-black text-slate-900">
                    {formatCurrency(cat.basePrice)} {cat.perKmRate > 0 && `+ ₹${cat.perKmRate}/km`}
                  </p>
                </div>

                <button
                  onClick={() => openEditModal(cat)}
                  className="p-2 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition"
                  title="Edit Category"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              {editingCategory ? 'Edit Service Category' : 'Create Service Category'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile EV Charging Assistance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain scope of service provided on-site..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Per KM Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.perKmRate}
                    onChange={(e) => setFormData({ ...formData, perKmRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-semibold text-slate-700">
                  Active (Available for customer booking dispatch)
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shadow"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
