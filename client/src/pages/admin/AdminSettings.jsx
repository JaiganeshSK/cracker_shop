import React, { useState, useEffect, useRef } from 'react';
import {
  Settings, Save, CheckCircle2, AlertCircle, UploadCloud, Trash2,
  Image as ImageIcon, Loader2, FileText, Download, Eye, ExternalLink,
  MessageSquare, Instagram, PhoneCall
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { showSuccessToast, showErrorToast } from '../../utils/swal';

const AdminSettings = () => {
  const { updateStoreSettings } = useCart();
  const [formData, setFormData] = useState({
    shopName: '',
    logoUrl: '',
    tagline: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    email: '',
    address: '',
    minOrderValue: 3000,
    freeDeliveryAbove: 0,
    defaultDeliveryFee: 0,
    announcementText: '',
    isAnnouncementActive: true,
    upiId: '',
    priceListUrl: '',
    priceListFileName: '',
    priceListUploadedAt: null,
    showPriceListNotice: true,
    priceListNoticeText: '💥 Diwali 2026 Wholesale Rate Card Available - View & Download PDF',
    showChatWidget: true,
    chatWidgetGreeting: 'Hi there! Have questions about crackers, pricing, or your order? Connect with us directly on WhatsApp or Instagram!',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFeedback, setLogoFeedback] = useState({ type: '', message: '' });
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfFeedback, setPdfFeedback] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.setting) {
          setFormData({
            ...res.data.setting,
            logoUrl: res.data.setting.logoUrl || '',
            instagram: res.data.setting.instagram || '',
            showChatWidget: res.data.setting.showChatWidget !== false,
            chatWidgetGreeting: res.data.setting.chatWidgetGreeting || 'Hi there! Have questions about crackers, pricing, or your order? Connect with us directly on WhatsApp or Instagram!',
            phone: res.data.setting.phone?.replace('+91', '') || '',
            whatsapp: res.data.setting.whatsapp?.replace('+91', '') || '',
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
    let finalValue = type === 'checkbox' ? checked : value;
    
    if (name === 'phone' || name === 'whatsapp') {
      finalValue = finalValue.replace(/\D/g, '').slice(0, 10);
    }
    
    setFormData({
      ...formData,
      [name]: finalValue,
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

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setPdfFeedback({ type: 'error', message: 'Please select a valid PDF document (*.pdf)' });
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', file);

    setUploadingPdf(true);
    setPdfFeedback({ type: '', message: '' });

    try {
      const res = await api.post('/upload/pdf', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success && res.data.fileUrl) {
        const updated = {
          ...formData,
          priceListUrl: res.data.fileUrl,
          priceListFileName: res.data.originalName || file.name,
          priceListUploadedAt: res.data.uploadedAt || new Date(),
        };
        setFormData(updated);
        await api.put('/settings', updated);
        updateStoreSettings(updated);
        setPdfFeedback({ type: 'success', message: 'Wholesale Rate List PDF uploaded successfully and live for customers!' });
        showSuccessToast('Rate List PDF uploaded successfully!');
      } else {
        setPdfFeedback({ type: 'error', message: res.data.message || 'Upload failed' });
      }
    } catch (err) {
      console.error('PDF upload error:', err);
      setPdfFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to upload PDF rate file',
      });
      showErrorToast(err.response?.data?.message || 'PDF upload failed');
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  const handleRemovePdf = async () => {
    try {
      if (formData.priceListUrl) {
        await api.delete('/upload/pdf', { data: { fileUrl: formData.priceListUrl } });
      }
    } catch (e) {
      console.warn('Could not delete old PDF from server storage:', e);
    }
    const updated = {
      ...formData,
      priceListUrl: '',
      priceListFileName: '',
      priceListUploadedAt: null,
    };
    setFormData(updated);
    await api.put('/settings', updated);
    updateStoreSettings(updated);
    setPdfFeedback({ type: 'info', message: 'Rate List PDF removed from store.' });
    showSuccessToast('Rate card PDF removed');
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.email) {
      showErrorToast('Support Email & Login Email is mandatory');
      return;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showErrorToast('Please enter a valid support email address');
        return;
      }
    }

    if (formData.phone && formData.phone.length !== 10) {
      showErrorToast('Support Phone Number must be exactly 10 digits');
      return;
    }

    if (formData.whatsapp && formData.whatsapp.length !== 10) {
      showErrorToast('WhatsApp Number must be exactly 10 digits');
      return;
    }

    setSaving(true);
    setSuccessMsg('');
    try {
      const payload = {
        ...formData,
        phone: formData.phone ? `+91${formData.phone}` : '',
        whatsapp: formData.whatsapp ? `+91${formData.whatsapp}` : '',
        freeDeliveryAbove: 0,
        defaultDeliveryFee: 0,
      };
      const res = await api.put('/settings', payload);
      if (res.data.success) {
        if (res.data.setting) {
          updateStoreSettings(res.data.setting);
        } else {
          updateStoreSettings(payload);
        }
        setSuccessMsg('Store settings saved successfully!');
        showSuccessToast('Store settings saved successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      showErrorToast(err.response?.data?.message || 'Error updating settings');
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
                        <span>Uploading Logo...</span>
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

                <div className="text-[11px] text-slate-400">
                  Recommended: Transparent PNG, SVG, or high-resolution JPG.
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
              <label className="block text-slate-300 font-semibold mb-1">Store Display Name (Public Store)</label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                placeholder="e.g. Public Store"
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
              <div className="flex">
                <span className="inline-flex items-center px-3.5 bg-slate-800 border border-r-0 border-slate-700 rounded-l-xl text-slate-400 font-medium">
                  +91
                </span>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10 digit mobile number"
                  maxLength="10"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-r-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Support Email &amp; Login Email <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="e.g. orders@publicstore.com"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                WhatsApp Order Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3.5 bg-slate-800 border border-r-0 border-slate-700 rounded-l-xl text-slate-400 font-medium">
                  +91
                </span>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="10 digit mobile number"
                  maxLength="10"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-r-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Instagram Profile / Handle
              </label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram || ''}
                onChange={handleChange}
                placeholder="e.g. publicstore or https://instagram.com/publicstore"
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

        {/* Wholesale Ordering Rules */}
        <div className="pt-4 border-t border-slate-800">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">
            Wholesale Ordering Rules
          </h2>
          <div className="max-w-md">
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
              <span className="text-[11px] text-slate-500">Default wholesale limit required for checkout</span>
            </div>
          </div>
        </div>

        {/* Wholesale Price List / Rate Card (PDF) */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                Wholesale Price List / Rate Card (PDF)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload your official rate card PDF. Customers will see an announcement notice with 1-click view and download options.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {formData.priceListUrl ? (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-white truncate">
                      {formData.priceListFileName || 'Wholesale-Price-List.pdf'}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {formData.priceListUploadedAt
                        ? `Uploaded: ${new Date(formData.priceListUploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                        : 'Active and available to customers'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <a
                    href={formData.priceListUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View PDF</span>
                  </a>

                  <a
                    href={formData.priceListUrl}
                    download={formData.priceListFileName || 'Price-List.pdf'}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={uploadingPdf}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-lg border border-amber-500/30 transition-colors disabled:opacity-50"
                  >
                    {uploadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                    <span>Replace</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemovePdf}
                    className="inline-flex items-center justify-center p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg border border-rose-500/20 transition-colors"
                    title="Remove PDF"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => pdfInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all bg-slate-900/40 hover:bg-slate-900/80 group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3 transition-colors">
                  {uploadingPdf ? (
                    <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>
                <div className="font-bold text-sm text-white mb-1">
                  {uploadingPdf ? 'Uploading rate card PDF...' : 'Click to Upload Wholesale Price List (PDF)'}
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Select a PDF rate sheet from your computer. Maximum size 25MB.
                </p>
              </div>
            )}

            <input
              type="file"
              ref={pdfInputRef}
              onChange={handlePdfUpload}
              accept="application/pdf"
              className="hidden"
            />

            {/* Upload Feedback */}
            {pdfFeedback.message && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  pdfFeedback.type === 'error'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {pdfFeedback.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{pdfFeedback.message}</span>
              </div>
            )}


          </div>
        </div>

        {/* Customer Support Chatbot Widget (WhatsApp & Instagram) */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Live Chatbot Support Widget</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Floating customer support assistant offering direct 1-click WhatsApp and Instagram message links.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            {/* Enable / Disable Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showChatWidget"
                name="showChatWidget"
                checked={formData.showChatWidget !== false}
                onChange={handleChange}
                className="w-4 h-4 text-amber-500 bg-slate-950 border-slate-700 rounded focus:ring-amber-500"
              />
              <label htmlFor="showChatWidget" className="text-xs sm:text-sm font-semibold text-slate-200 cursor-pointer">
                Display floating customer support chatbot on store pages
              </label>
            </div>

            {/* Greeting Text Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Chatbot Welcome Greeting Message
              </label>
              <textarea
                rows={2}
                name="chatWidgetGreeting"
                value={formData.chatWidgetGreeting || ''}
                onChange={handleChange}
                placeholder="e.g. Hi there! Welcome to our store. How can we assist you with crackers, discounts, or placing your order today?"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
              />
              <span className="text-[11px] text-slate-500">
                Shown as the assistant's greeting when customers open the chat widget
              </span>
            </div>

            {/* Channels Status Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>WhatsApp Channel</span>
                    {formData.whatsapp ? (
                      <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-semibold">Not Set</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {formData.whatsapp || 'Set number in Shop Contact Info above'}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 flex-shrink-0">
                  <Instagram className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Instagram Channel</span>
                    {formData.instagram ? (
                      <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-semibold">Not Set</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {formData.instagram || 'Set handle in Shop Contact Info above'}
                  </div>
                </div>
              </div>
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
              placeholder="e.g. shopname@upi"
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
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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
