import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, UploadCloud, CheckCircle, X, Volume2, Sparkles, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    category: 'Sparklers',
    description: '',
    mrp: '',
    price: '',
    discountPercentage: '',
    piecePerBox: '10 Pcs / Box',
    imageUrl: '',
    soundLevel: 'Mild Sound',
    inStock: true,
    featured: false,
  };
  const [formData, setFormData] = useState(initialForm);

  // Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFeedback, setImageFeedback] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
      ]);
      if (prodRes.data.success) setProducts(prodRes.data.products);
      if (catRes.data.success) setCategories(catRes.data.categories);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCat === 'All' || p.category === selectedCat;
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Open Modal for Add
  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setCurrentId(null);
    setImageFeedback('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (p) => {
    setFormData({
      name: p.name,
      category: p.category,
      description: p.description || '',
      mrp: p.mrp,
      price: p.price,
      discountPercentage: p.discountPercentage,
      piecePerBox: p.piecePerBox || '1 Box',
      imageUrl: p.imageUrl || '',
      soundLevel: p.soundLevel || 'Mild Sound',
      inStock: p.inStock,
      featured: p.featured || false,
    });
    setIsEditing(true);
    setCurrentId(p._id);
    setImageFeedback(p.imageUrl ? 'Existing WebP Image Loaded' : '');
    setIsModalOpen(true);
  };

  // Handle Image Upload & Sharp WebP conversion
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setUploadingImage(true);
    setImageFeedback('');
    try {
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setFormData((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
        setImageFeedback(`✅ Converted to WebP format (${res.data.imageUrl})`);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setImageFeedback('❌ Failed to upload & convert image. Please check file type.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Auto Price / Discount Calculator
  const handleMrpChange = (val) => {
    const mrp = parseFloat(val) || 0;
    const discount = parseFloat(formData.discountPercentage) || 0;
    const price = discount > 0 ? Math.round(mrp - (mrp * discount) / 100) : mrp;
    setFormData((prev) => ({ ...prev, mrp: val, price: price.toString() }));
  };

  const handleDiscountChange = (val) => {
    const discount = parseFloat(val) || 0;
    const mrp = parseFloat(formData.mrp) || 0;
    const price = mrp > 0 ? Math.round(mrp - (mrp * discount) / 100) : 0;
    setFormData((prev) => ({ ...prev, discountPercentage: val, price: price.toString() }));
  };

  const handlePriceChange = (val) => {
    const price = parseFloat(val) || 0;
    const mrp = parseFloat(formData.mrp) || 0;
    const discount = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
    setFormData((prev) => ({ ...prev, price: val, discountPercentage: discount.toString() }));
  };

  // Toggle Stock Quick Switch
  const handleToggleStock = async (product) => {
    try {
      const res = await api.patch(`/products/${product._id}/stock`, {
        inStock: !product.inStock,
      });
      if (res.data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, inStock: !p.inStock } : p))
        );
      }
    } catch (err) {
      console.error('Stock toggle failed:', err);
    }
  };

  // Save Product (Create or Update)
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        mrp: parseFloat(formData.mrp),
        price: parseFloat(formData.price),
        discountPercentage: parseFloat(formData.discountPercentage),
      };

      if (isEditing) {
        const res = await api.put(`/products/${currentId}`, payload);
        if (res.data.success) {
          fetchProducts();
          setIsModalOpen(false);
        }
      } else {
        const res = await api.post('/products', payload);
        if (res.data.success) {
          fetchProducts();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Error saving product:', err);
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will also remove its WebP image file.`)) {
      try {
        const res = await api.delete(`/products/${id}`);
        if (res.data.success) {
          setProducts((prev) => prev.filter((p) => p._id !== id));
        }
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  const defaultCategories = [
    'Single Sound Crackers',
    'Sparklers',
    'Ground Chakkars',
    'Flower Pots',
    'Rockets & Missiles',
    'Fancy Aerial & Sky Shots',
    'Novelty & Kids Crackers',
    'Gift Boxes & Combos',
  ];

  const categoryList =
    categories.length > 0 ? categories.map((c) => c.name) : defaultCategories;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Products & Inventory</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage cracker listings, pricing, stock availability, and WebP product images.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Cracker</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search crackers by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Categories</option>
            {categoryList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading cracker catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-16">Image</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Packing</th>
                  <th className="py-3 px-4 text-right">MRP</th>
                  <th className="py-3 px-4 text-right">Offer Price</th>
                  <th className="py-3 px-4 text-center">Discount</th>
                  <th className="py-3 px-4 text-center">Stock Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-800/30 transition-colors">
                    {/* WebP Thumbnail */}
                    <td className="py-2.5 px-4">
                      <img
                        src={product.imageUrl || '/uploads/products/placeholder.webp'}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg bg-slate-900 border border-slate-800"
                        loading="lazy"
                      />
                    </td>

                    {/* Name */}
                    <td className="py-2.5 px-4 font-bold text-white max-w-xs truncate">
                      {product.name}
                      {product.featured && (
                        <span className="ml-2 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          Featured
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-4 text-slate-300">
                      {product.category}
                    </td>

                    {/* Packing */}
                    <td className="py-2.5 px-4 text-slate-400">
                      {product.piecePerBox}
                    </td>

                    {/* MRP */}
                    <td className="py-2.5 px-4 text-right line-through text-slate-400">
                      ₹{product.mrp}
                    </td>

                    {/* Offer Price */}
                    <td className="py-2.5 px-4 text-right font-black text-amber-400 text-sm">
                      ₹{product.price}
                    </td>

                    {/* Discount % */}
                    <td className="py-2.5 px-4 text-center">
                      <span className="bg-rose-500/10 text-rose-400 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        {product.discountPercentage}%
                      </span>
                    </td>

                    {/* Quick Stock Switch Toggle */}
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStock(product)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                          product.inStock
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30'
                        }`}
                        title="Click to toggle In-Stock / Out-of-Stock"
                      >
                        {product.inStock ? '✓ In Stock' : '✕ Out of Stock'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                        title="Edit Cracker"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id, product.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Cracker"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT PRODUCT MODAL (With WebP Upload Pipeline) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white">
                  {isEditing ? 'Edit Cracker Product' : 'Add New Cracker Item'}
                </h3>
                <p className="text-xs text-slate-400">
                  Fill details and upload photo. Photos automatically convert to WebP for fast performance.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-4 text-xs sm:text-sm">
              {/* Image Upload Box with WebP conversion */}
              <div className="p-4 bg-slate-950/70 border border-dashed border-slate-700 rounded-xl space-y-3">
                <label className="block text-slate-300 font-bold">
                  Cracker Photo (Converts to WebP Automatically)
                </label>

                <div className="flex items-center gap-4">
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-xl border border-slate-700 bg-slate-900"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-500">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors border border-slate-700">
                      <UploadCloud className="w-4 h-4 text-amber-400" />
                      <span>{uploadingImage ? 'Converting to WebP...' : 'Choose Image (JPG / PNG)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                    {imageFeedback && (
                      <div className="text-[11px] text-amber-300 mt-1 font-mono">
                        {imageFeedback}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Product Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 30 Shots Sky King"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    {categoryList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pack info & Sound level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Packaging Info</label>
                  <input
                    type="text"
                    placeholder="e.g. 10 Pcs / Box, 1 Piece"
                    value={formData.piecePerBox}
                    onChange={(e) => setFormData({ ...formData, piecePerBox: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sound / Audio Level</label>
                  <select
                    value={formData.soundLevel}
                    onChange={(e) => setFormData({ ...formData, soundLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Silent / Visual">Silent / Visual</option>
                    <option value="Mild Sound">Mild Sound</option>
                    <option value="Loud Sound">Loud Sound</option>
                    <option value="Musical / Whistling">Musical / Whistling</option>
                  </select>
                </div>
              </div>

              {/* Pricing & Calculator */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Live Price & Discount Calculator
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      MRP (₹) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 500"
                      value={formData.mrp}
                      onChange={(e) => handleMrpChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      placeholder="e.g. 80"
                      value={formData.discountPercentage}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Selling Price (₹) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 100"
                      value={formData.price}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-black"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description / Effects</label>
                <textarea
                  rows={2}
                  placeholder="Sparkle effects, burn duration, visual burst..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Switches: In Stock & Featured */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span>Mark as In-Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span>Feature on Homepage</span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
                >
                  {isEditing ? 'Save Changes' : 'Create Cracker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
