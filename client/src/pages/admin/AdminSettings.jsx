import React, { useState, useEffect, useRef } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle, UploadCloud, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '../../services/api';

const AdminSettings = () => {
  const [formData, setFormData] = useState({
    shopName: '',
    logoUrl: '',
    tagline: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    minOrderValue: 3000,
    freeDeliveryAbove: 12000,
    defaultDeliveryFee: 250,
    announcementText: '',
    isAnnouncementActive: true,
    upiId: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFeedback, setLogoFeedback] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.setting) {
          setFormData({
            ...res.data.setting,
            logoUrl: res.data.setting.logoUrl || '',
          });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoFeedback({ type: 'error', message: 'Please select a valid image file (PNG, JPG, SVG, WebP)' });
      return;
    }

    const uploadData = new FormData();
    uploadData.append('image', file);

    setUploadingLogo(true);
    setLogoFeedback({ type: '', message: '' });

    try {
      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success && res.data.imageUrl) {
        setFormData((prev) => ({
          ...prev,
          logoUrl: res.data.imageUrl,
        }));
        setLogoFeedback({ type: 'success', message: 'Logo uploaded successfully! Click "Save Store Settings" to apply.' });
      } else {
        setLogoFeedback({ type: 'error', message: res.data.message || 'Upload failed' });
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      setLogoFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to upload logo image',
      });
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
    setLogoFeedback({ type: 'info', message: 'Logo removed. Click "Save Store Settings" to apply.' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const res = await api.put('/settings', formData);
      if (res.data.success) {
        setSuccessMsg('Store settings saved successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      alert('Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading store settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Store & Business Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure shop identity, minimum order values, delivery thresholds, and announcement banners.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 text-xs sm:text-sm">
        {/* Basic Brand Identity */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">
            Shop Brand & Contact Info
          </h2>

          {/* Brand Logo Upload Card */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  Store Brand Logo
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload your official brand logo. It will appear on the customer storefront header, navigation bar, and footer.
                </p>
              </div>
              {formData.logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Logo
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Logo Preview Box */}
              <div className="w-36 h-20 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center p-2.5 overflow-hidden flex-shrink-0 relative group">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Store Logo"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/200x80/0f172a/f59e0b?text=Invalid+Logo';
                    }}
                  />
                ) : (
                  <div className="text-center text-slate-600">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <span className="text-[10px] block">No logo uploaded</span>
                  </div>
                )}
              </div>

              {/* Upload Action */}
              <div className="space-y-2 flex-1 w-full">
                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs shadow-md transition-colors">
                    {uploadingLogo ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading &amp; Converting...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>{formData.logoUrl ? 'Change Logo Image' : 'Upload Logo Image'}</span>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>

                  {formData.logoUrl && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Logo Configured
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500">
                  Recommended: Transparent PNG, SVG, or high-res JPG. Converted to WebP automatically.
                </div>

                {/* Or manual URL */}
                <div className="pt-1">
                  <input
                    type="text"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    placeholder="Or paste direct logo image URL..."
                    className="w-full text-xs px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {logoFeedback.message && (
                  <div
                    className={`text-xs p-2 rounded-lg ${
                      logoFeedback.type === 'error'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {logoFeedback.message}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Shop Name</label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Support Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                WhatsApp Order Number (with Country Code e.g. 919443123456)
              </label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Factory Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Order Rules & Delivery Fees */}
        <div className="pt-4 border-t border-slate-800">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">
            Wholesale Ordering & Delivery Thresholds
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Minimum Order Value (₹)</label>
              <input
                type="number"
                min="0"
                name="minOrderValue"
                value={formData.minOrderValue}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
              />
              <span className="text-[11px] text-slate-500">Default wholesale limit</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Free Delivery Above (₹)</label>
              <input
                type="number"
                min="0"
                name="freeDeliveryAbove"
                value={formData.freeDeliveryAbove}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-emerald-400"
              />
              <span className="text-[11px] text-slate-500">Threshold for ₹0 delivery</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                min="0"
                name="defaultDeliveryFee"
                value={formData.defaultDeliveryFee}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
              />
              <span className="text-[11px] text-slate-500">Under threshold fee</span>
            </div>
          </div>
        </div>

        {/* Payment & UPI ID */}
        <div className="pt-4 border-t border-slate-800">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">
            Store UPI Payment Configuration
          </h2>
          <div className="max-w-md">
            <label className="block text-slate-300 font-semibold mb-1">Shop UPI ID</label>
            <input
              type="text"
              name="upiId"
              value={formData.upiId}
              onChange={handleChange}
              placeholder="e.g. srikrishnafireworks@upi"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-amber-400 focus:outline-none focus:border-amber-500"
            />
            <span className="text-[11px] text-slate-500">Displayed to customers for direct UPI payment</span>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="pt-4 border-t border-slate-800">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">
            Website Top Announcement Banner
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                name="isAnnouncementActive"
                checked={formData.isAnnouncementActive}
                onChange={handleChange}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span>Display top announcement ticker on customer storefront</span>
            </label>

            <div>
              <input
                type="text"
                name="announcementText"
                value={formData.announcementText}
                onChange={handleChange}
                placeholder="Banner message..."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Store Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
