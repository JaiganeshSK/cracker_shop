import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  UploadCloud,
  CheckCircle,
  X,
  Volume2,
  Sparkles,
  Image as ImageIcon,
  Layers,
  Copy,
  AlertCircle,
  Loader2,
} from 'lucide-react';
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
    imageFileName: '',
    soundLevel: 'Mild Sound',
    inStock: true,
    featured: false,
  };
  const [formData, setFormData] = useState(initialForm);

  // Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFeedback, setImageFeedback] = useState('');

  // Multiple / Bulk Product Insert State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkProducts, setBulkProducts] = useState([]);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [bulkFeedback, setBulkFeedback] = useState({ type: '', message: '', errors: [] });
  const [uploadingRowIndex, setUploadingRowIndex] = useState(null);

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
      imageFileName: p.imageFileName || '',
      soundLevel: p.soundLevel || 'Mild Sound',
      inStock: p.inStock,
      featured: p.featured || false,
    });
    setIsEditing(true);
    setCurrentId(p._id);
    setImageFeedback(p.imageUrl ? 'Existing WebP Image Loaded' : '');
    setIsModalOpen(true);
  };

  // Handle Image Upload to Vercel Blob & Sharp WebP conversion
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
        setFormData((prev) => ({
          ...prev,
          imageUrl: res.data.imageUrl,
          imageFileName: res.data.filename || '',
        }));
        setImageFeedback(`✅ Uploaded to Vercel Blob: ${res.data.filename}`);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setImageFeedback('❌ Failed to upload image. Please check file type.');
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

  // --- MULTIPLE PRODUCT INSERT HANDLERS ---
  const createEmptyProductRow = (cat) => {
    const defaultCat = cat || (categoryList.length > 0 ? categoryList[0] : 'Sparklers');
    return {
      tempId: Date.now() + '-' + Math.random().toString(36).substring(2, 9),
      name: '',
      category: defaultCat,
      description: '',
      mrp: '',
      price: '',
      discountPercentage: 0,
      piecePerBox: '10 Pcs / Box',
      imageUrl: '',
      imageFileName: '',
      soundLevel: 'Mild Sound',
      inStock: true,
      featured: false,
    };
  };

  const handleOpenBulkAdd = () => {
    const initialCat = selectedCat !== 'All' ? selectedCat : (categoryList[0] || 'Sparklers');
    setBulkProducts([
      createEmptyProductRow(initialCat),
      createEmptyProductRow(initialCat),
    ]);
    setBulkFeedback({ type: '', message: '', errors: [] });
    setUploadingRowIndex(null);
    setIsBulkModalOpen(true);
  };

  const handleAddBulkRow = () => {
    const prevCat = bulkProducts.length > 0 ? bulkProducts[bulkProducts.length - 1].category : categoryList[0];
    setBulkProducts((prev) => [...prev, createEmptyProductRow(prevCat)]);
  };

  const handleRemoveBulkRow = (index) => {
    if (bulkProducts.length <= 1) {
      setBulkProducts([createEmptyProductRow()]);
      return;
    }
    setBulkProducts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDuplicateBulkRow = (index) => {
    const rowToClone = bulkProducts[index];
    const cloned = {
      ...rowToClone,
      tempId: Date.now() + '-' + Math.random().toString(36).substring(2, 9),
      name: rowToClone.name ? `${rowToClone.name} (Copy)` : '',
    };
    setBulkProducts((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, cloned);
      return next;
    });
  };

  const handleBulkRowChange = (index, field, value) => {
    setBulkProducts((prev) =>
      prev.map((row, idx) => {
        if (idx !== index) return row;
        const updated = { ...row, [field]: value };

        if (field === 'mrp' || field === 'price') {
          const mrp = field === 'mrp' ? parseFloat(value) || 0 : parseFloat(row.mrp) || 0;
          const price = field === 'price' ? parseFloat(value) || 0 : parseFloat(row.price) || 0;
          updated.discountPercentage = mrp > 0 && price >= 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
        }

        return updated;
      })
    );
  };

  const handleBulkRowImageUpload = async (index, file) => {
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setUploadingRowIndex(index);
    try {
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setBulkProducts((prev) =>
          prev.map((row, idx) =>
            idx === index
              ? {
                  ...row,
                  imageUrl: res.data.imageUrl,
                  imageFileName: res.data.filename || '',
                }
              : row
          )
        );
      }
    } catch (err) {
      console.error(`Row ${index + 1} image upload failed:`, err);
      alert(`Image upload failed for item #${index + 1}. Please check file type.`);
    } finally {
      setUploadingRowIndex(null);
    }
  };

  const handleApplyCategoryToAll = (cat) => {
    if (!cat) return;
    setBulkProducts((prev) => prev.map((row) => ({ ...row, category: cat })));
  };

  const handleSubmitBulk = async (e) => {
    e.preventDefault();
    setBulkFeedback({ type: '', message: '', errors: [] });

    // Client-side validation
    const validationErrors = [];
    bulkProducts.forEach((p, idx) => {
      const rowNum = idx + 1;
      if (!p.name?.trim()) validationErrors.push(`Product #${rowNum}: Name is required`);
      if (!p.category?.trim()) validationErrors.push(`Product #${rowNum}: Category is required`);
      if (p.mrp === '' || isNaN(parseFloat(p.mrp)) || parseFloat(p.mrp) <= 0) {
        validationErrors.push(`Product #${rowNum}: Valid MRP is required`);
      }
      if (p.price === '' || isNaN(parseFloat(p.price)) || parseFloat(p.price) < 0) {
        validationErrors.push(`Product #${rowNum}: Valid Selling Price is required`);
      }
    });

    if (validationErrors.length > 0) {
      setBulkFeedback({
        type: 'error',
        message: `Please resolve ${validationErrors.length} required field(s):`,
        errors: validationErrors,
      });
      return;
    }

    setIsSubmittingBulk(true);
    try {
      const payload = bulkProducts.map((p) => ({
        name: p.name.trim(),
        category: p.category.trim(),
        description: p.description?.trim() || '',
        mrp: parseFloat(p.mrp),
        price: parseFloat(p.price),
        discountPercentage: p.discountPercentage || 0,
        piecePerBox: p.piecePerBox?.trim() || '1 Box',
        imageUrl: p.imageUrl || '',
        imageFileName: p.imageFileName || '',
        soundLevel: p.soundLevel || 'Mild Sound',
        inStock: p.inStock,
        featured: p.featured,
      }));

      const res = await api.post('/products/bulk', payload);

      if (res.data.success) {
        setIsBulkModalOpen(false);
        fetchProducts();
        alert(`🎉 Successfully added ${res.data.count || payload.length} products to inventory!`);
      }
    } catch (err) {
      console.error('Bulk submission error:', err);
      const msg = err.response?.data?.message || 'Failed to submit multiple products.';
      const serverErrors = err.response?.data?.errors || [];
      setBulkFeedback({
        type: 'error',
        message: msg,
        errors: serverErrors,
      });
    } finally {
      setIsSubmittingBulk(false);
    }
  };

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

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleOpenBulkAdd}
            className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 hover:border-amber-500/60 shadow-lg shadow-black/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Add Multiple Products</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Cracker</span>
          </button>
        </div>
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

      {/* MULTIPLE PRODUCT INSERT MODAL (Bulk Provision with Add & Remove Rows + Vercel Blob Upload) */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-white">Add Multiple Products</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {bulkProducts.length} {bulkProducts.length === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Add or remove rows dynamically. Each item uploads directly to Vercel Blob with automated WebP conversion.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddBulkRow}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add Row</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Subheader Quick Actions Bar */}
            <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-4 flex-wrap text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <span>Quick Apply Category to All:</span>
                <select
                  onChange={(e) => handleApplyCategoryToAll(e.target.value)}
                  defaultValue=""
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="" disabled>Select Category</option>
                  {categoryList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Photos automatically upload to Vercel Blob with date-time naming</span>
              </div>
            </div>

            {/* Error Feedback Banner */}
            {bulkFeedback.type === 'error' && (
              <div className="mx-5 mt-4 p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{bulkFeedback.message}</span>
                </div>
                {bulkFeedback.errors && bulkFeedback.errors.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-300/90 pl-1">
                    {bulkFeedback.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {bulkFeedback.errors.length > 5 && (
                      <li>...and {bulkFeedback.errors.length - 5} more issues</li>
                    )}
                  </ul>
                )}
              </div>
            )}

            {/* Scrollable Dynamic Rows List */}
            <form onSubmit={handleSubmitBulk} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {bulkProducts.map((row, index) => {
                const isUploadingThisRow = uploadingRowIndex === index;

                return (
                  <div
                    key={row.tempId || index}
                    className="bg-slate-950/60 hover:bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition-all space-y-4 relative group shadow-sm"
                  >
                    {/* Row Header: Number, Stock Toggle, Duplicate & Remove */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xs">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-300">
                          {row.name ? row.name : `Product #${index + 1}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* In-Stock Toggle */}
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-400 hover:text-slate-200">
                          <input
                            type="checkbox"
                            checked={row.inStock}
                            onChange={(e) => handleBulkRowChange(index, 'inStock', e.target.checked)}
                            className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
                          />
                          <span>In Stock</span>
                        </label>

                        {/* Featured Toggle */}
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-400 hover:text-slate-200">
                          <input
                            type="checkbox"
                            checked={row.featured}
                            onChange={(e) => handleBulkRowChange(index, 'featured', e.target.checked)}
                            className="w-3.5 h-3.5 accent-amber-500 rounded cursor-pointer"
                          />
                          <span>Featured</span>
                        </label>

                        {/* Duplicate Button */}
                        <button
                          type="button"
                          onClick={() => handleDuplicateBulkRow(index)}
                          title="Duplicate this row"
                          className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 transition-colors"
                        >
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span className="hidden sm:inline">Duplicate</span>
                        </button>

                        {/* Remove Row Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveBulkRow(index)}
                          title="Remove this product"
                          className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* Row Content: Image Uploader + Details Form */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      
                      {/* Vercel Blob Image Box */}
                      <div className="flex flex-col items-center gap-1.5 self-center sm:self-start">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border border-slate-800 bg-slate-900 relative overflow-hidden flex items-center justify-center group/img">
                          {row.imageUrl ? (
                            <>
                              <img
                                src={row.imageUrl}
                                alt="Cracker"
                                className="w-full h-full object-cover rounded-xl"
                              />
                              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                <label className="cursor-pointer text-[10px] text-amber-300 font-bold px-2 py-1 bg-slate-900/90 rounded-md border border-amber-500/30 shadow">
                                  Change
                                  <input
                                    type="file"
                                    accept="image/*"
                                    disabled={isUploadingThisRow}
                                    onChange={(e) => handleBulkRowImageUpload(index, e.target.files[0])}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                              <div className="absolute top-1 right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5">
                                <CheckCircle className="w-3 h-3" />
                              </div>
                            </>
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center p-2 cursor-pointer text-slate-500 hover:text-amber-400 transition-colors text-center">
                              {isUploadingThisRow ? (
                                <div className="flex flex-col items-center gap-1">
                                  <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                                  <span className="text-[10px] text-slate-400 font-mono">Uploading...</span>
                                </div>
                              ) : (
                                <>
                                  <UploadCloud className="w-5 h-5 mb-1" />
                                  <span className="text-[10px] font-semibold leading-tight">Upload Photo</span>
                                  <span className="text-[9px] text-slate-600">Vercel Blob</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    disabled={isUploadingThisRow}
                                    onChange={(e) => handleBulkRowImageUpload(index, e.target.files[0])}
                                    className="hidden"
                                  />
                                </>
                              )}
                            </label>
                          )}
                        </div>
                        {row.imageFileName && (
                          <span className="text-[9px] text-slate-500 font-mono truncate max-w-[110px]" title={row.imageFileName}>
                            {row.imageFileName}
                          </span>
                        )}
                      </div>

                      {/* Input Fields Grid */}
                      <div className="flex-1 w-full space-y-3">
                        {/* Line 1: Name & Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-7">
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Cracker Name <span className="text-amber-400">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g., 10cm Electric Sparklers"
                              value={row.name}
                              onChange={(e) => handleBulkRowChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="sm:col-span-5">
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Category <span className="text-amber-400">*</span>
                            </label>
                            <select
                              required
                              value={row.category}
                              onChange={(e) => handleBulkRowChange(index, 'category', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                            >
                              {categoryList.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Line 2: Pricing & Packing */}
                        <div className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-end">
                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                              MRP (₹) <span className="text-amber-400">*</span>
                            </label>
                            <input
                              type="number"
                              required
                              min="0"
                              placeholder="100"
                              value={row.mrp}
                              onChange={(e) => handleBulkRowChange(index, 'mrp', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Offer Price (₹) <span className="text-amber-400">*</span>
                            </label>
                            <input
                              type="number"
                              required
                              min="0"
                              placeholder="30"
                              value={row.price}
                              onChange={(e) => handleBulkRowChange(index, 'price', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          {/* Discount % Auto Badge */}
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Discount</label>
                            <div className={`px-2.5 py-2 rounded-xl text-xs font-black text-center border ${
                              row.discountPercentage > 0
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}>
                              {row.discountPercentage > 0 ? `${row.discountPercentage}% OFF` : '0%'}
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Packing</label>
                            <input
                              type="text"
                              placeholder="1 Box"
                              value={row.piecePerBox}
                              onChange={(e) => handleBulkRowChange(index, 'piecePerBox', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sound</label>
                            <select
                              value={row.soundLevel}
                              onChange={(e) => handleBulkRowChange(index, 'soundLevel', e.target.value)}
                              className="w-full px-2 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 truncate"
                            >
                              <option value="Mild Sound">Mild</option>
                              <option value="Loud Sound">Loud</option>
                              <option value="Silent / Visual">Silent</option>
                              <option value="Musical / Whistling">Musical</option>
                            </select>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}

              {/* Big Prominent + Add Another Product Button */}
              <button
                type="button"
                onClick={handleAddBulkRow}
                className="w-full py-4 border-2 border-dashed border-slate-800 hover:border-amber-500/60 rounded-2xl bg-slate-950/40 hover:bg-slate-900/60 text-slate-400 hover:text-amber-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all group cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500/10 group-hover:bg-amber-500 text-amber-400 group-hover:text-slate-950 flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <span>+ Add Another Product</span>
              </button>

              {/* Sticky Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4 flex-wrap sticky bottom-0 bg-slate-900/95 pb-1">
                <div className="text-xs text-slate-400">
                  Total <strong className="text-white font-bold">{bulkProducts.length}</strong> cracker {bulkProducts.length === 1 ? 'item' : 'items'} ready to insert
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBulk || bulkProducts.length === 0}
                    className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    {isSubmittingBulk ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving {bulkProducts.length} Products...</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4" />
                        <span>Save All {bulkProducts.length} Products</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
