import React, { useState, useEffect } from 'react';
import { Search, Printer, Eye, X, MessageSquare, Trash2 } from 'lucide-react';
import api from '../../services/api';
import InvoiceModal from '../../components/InvoiceModal';
import { printInvoice } from '../../utils/printInvoice';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../../utils/swal';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Order for Modal / Packing Slip
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Professional Invoice Modal State
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState(null);

  // Tracking edit state
  const [trackingInput, setTrackingInput] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'All') params.append('status', activeTab);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/orders?${params.toString()}`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, searchQuery, startDate, endDate]);

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => {
        if (res.data.success && res.data.setting) {
          setStoreSettings(res.data.setting);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenInvoice = (order) => {
    setInvoiceOrder(order);
    setIsInvoiceOpen(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, {
        orderStatus: newStatus,
      });
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
        showSuccessToast(`Order status updated to "${newStatus}"`);
      }
    } catch (err) {
      console.error('Status change error:', err);
      showErrorToast('Failed to update status');
    }
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const res = await api.patch(`/orders/${selectedOrder._id}/status`, {
        trackingNumber: trackingInput,
      });
      if (res.data.success) {
        setSelectedOrder({ ...selectedOrder, trackingNumber: trackingInput });
        setOrders((prev) =>
          prev.map((o) =>
            o._id === selectedOrder._id ? { ...o, trackingNumber: trackingInput } : o
          )
        );
        showSuccessToast('Tracking details updated successfully');
      }
    } catch (err) {
      console.error('Tracking update error:', err);
      showErrorToast('Failed to save tracking details');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setTrackingInput(order.trackingNumber || '');
    setIsModalOpen(true);
  };

  const handlePrintSlip = () => {
    if (selectedOrder) {
      printInvoice(selectedOrder, storeSettings);
    }
  };

  const handleChatCustomerWhatsApp = (order) => {
    const rawPhone = order.customer?.whatsapp || order.customer?.phone || '';
    const phone = rawPhone.replace(/[^0-9]/g, '');
    const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
    const itemsSummary = order.items
      ? order.items.map((i) => `• ${i.name} (Qty: ${i.quantity})`).slice(0, 5).join('\n')
      : '';
    const text = encodeURIComponent(
      `Hello ${order.customer?.name || 'Customer'},\n` +
      `This is regarding your WhatsApp Order *#${order.orderId}* with ${storeSettings?.shopName || 'our store'}.\n\n` +
      `📦 *Order Status:* ${order.orderStatus}\n` +
      `💰 *Total Amount:* ₹${order.totalAmount?.toLocaleString()}\n` +
      (order.trackingNumber ? `🚚 *LR / Docket Tracking No:* ${order.trackingNumber}\n` : '') +
      `\nItems:\n${itemsSummary}${order.items && order.items.length > 5 ? `\n...and ${order.items.length - 5} more` : ''}\n\n` +
      `Please reply to this message if you have any questions or require assistance!`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank');
  };

  const handleDeleteOrder = async (orderId) => {
    const result = await showConfirmDialog({
      title: 'Delete Order?',
      text: 'Are you sure you want to delete this order? This action cannot be undone.',
      confirmButtonText: 'Yes, Delete',
      confirmColor: 'rose',
    });

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/orders/${orderId}`);
        if (res.data.success) {
          setOrders((prev) => prev.filter((o) => o._id !== orderId));
          showSuccessToast('Order deleted successfully');
        }
      } catch (err) {
        console.error('Delete order error:', err);
        showErrorToast('Failed to delete order');
      }
    }
  };

  const tabs = ['All', 'Pending', 'Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
      case 'Confirmed':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 'Packed':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
      case 'Dispatched':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'Delivered':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'Cancelled':
      default:
        return 'bg-slate-700/40 text-slate-400 border border-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Orders & Consignment Pipeline</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track incoming customer bookings, print packing slips, and update dispatch tracking.
          </p>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input and Date Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative w-full max-w-md flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Search Orders</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by Order ID, name, phone, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          
          <div className="flex items-end gap-2 w-full sm:w-auto text-xs sm:text-sm flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-amber-500"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-amber-500"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="mb-0.5 text-slate-400 hover:text-rose-400 transition-colors p-2 rounded-lg hover:bg-rose-500/10"
                title="Clear date filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No orders in this status tab.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">WhatsApp Order No</th>
                  <th className="py-3 px-4">Customer Info</th>
                  <th className="py-3 px-4">Delivery Location</th>
                  <th className="py-3 px-4">Items / Varieties</th>
                  <th className="py-3 px-4 text-right">Payable</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Pipeline Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Order ID */}
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">
                        {order.orderId}
                      </span>
                      <div className="text-[10px] text-slate-500 font-sans mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{order.customer.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-slate-400 text-[11px]">{order.customer.phone}</span>
                        <button
                          onClick={() => handleChatCustomerWhatsApp(order)}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"
                          title="Chat on WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-slate-300">
                      <div>{order.customer.city}</div>
                      <div className="text-[10px] text-slate-500">
                        {order.customer.state} - {order.customer.pincode}
                      </div>
                    </td>

                    {/* Items */}
                    <td className="py-3 px-4 text-slate-300">
                      <span className="font-bold text-white">{order.items.length}</span> Varieties
                    </td>

                    {/* Net Payable */}
                    <td className="py-3 px-4 text-right font-black text-amber-400 text-sm">
                      ₹{order.totalAmount.toLocaleString()}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {order.paymentMethod}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3 px-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-900 border focus:outline-none ${getStatusBadge(
                          order.orderStatus
                        )}`}
                      >
                        {tabs
                          .filter((t) => t !== 'All')
                          .map((st) => (
                            <option key={st} value={st} className="bg-slate-900 text-white">
                              {st}
                            </option>
                          ))}
                      </select>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleChatCustomerWhatsApp(order)}
                          className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 transition-colors"
                          title="Chat with Customer on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Chat</span>
                        </button>
                        <button
                          onClick={() => handleOpenInvoice(order)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition-colors"
                          title="View & Print Tax Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILED ORDER / PACKING SLIP MODAL */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 no-print">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 flex-wrap">
                  <span>Order Details</span>
                  <span className="text-amber-400 font-mono text-xs sm:text-sm">{selectedOrder.orderId}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Booked on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                <button
                  onClick={() => printInvoice(selectedOrder, storeSettings)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                  title="Print Professional Tax Invoice"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => handleOpenInvoice(selectedOrder)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  title="Preview A4 Invoice"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Header (Print mode only) */}
            <div className="hidden print-only text-center border-b pb-4">
              <h2 className="text-2xl font-black">{storeSettings?.shopName || 'Fireworks Store'}</h2>
              <p className="text-xs">Packing Slip & Consignment Dispatch Manifest</p>
              <p className="text-xs font-mono font-bold mt-1">Order ID: {selectedOrder.orderId}</p>
            </div>

            {/* Customer & Delivery Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Customer Information
                </div>
                <div className="font-bold text-white text-sm">{selectedOrder.customer.name}</div>
                <div className="text-slate-300 mt-1">Phone: {selectedOrder.customer.phone}</div>
                {selectedOrder.customer.whatsapp && (
                  <div className="text-slate-300">WhatsApp: {selectedOrder.customer.whatsapp}</div>
                )}
                {selectedOrder.customer.email && (
                  <div className="text-slate-400">Email: {selectedOrder.customer.email}</div>
                )}
                <button
                  type="button"
                  onClick={() => handleChatCustomerWhatsApp(selectedOrder)}
                  className="mt-3 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </button>
              </div>

              <div>
                <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Shipping Consignment Destination
                </div>
                <div className="text-slate-200 leading-relaxed">
                  {selectedOrder.customer.address}
                  {selectedOrder.customer.landmark ? `, Near ${selectedOrder.customer.landmark}` : ''}
                </div>
                <div className="text-amber-400 font-bold mt-1">
                  {selectedOrder.customer.city}, {selectedOrder.customer.state} - {selectedOrder.customer.pincode}
                </div>
                {selectedOrder.customer.preferredDeliveryDate && (
                  <div className="text-emerald-400 text-[11px] mt-1">
                    Preferred Delivery: {selectedOrder.customer.preferredDeliveryDate}
                  </div>
                )}
              </div>
            </div>

            {/* Itemized Packing Checklist */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Order Items & Quantity Checklist
              </div>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3 w-8 text-center">✓</th>
                      <th className="py-2 px-3">Item Name</th>
                      <th className="py-2 px-3 w-28">Pack</th>
                      <th className="py-2 px-3 w-16 text-center">Qty</th>
                      <th className="py-2 px-3 w-20 text-right">Price</th>
                      <th className="py-2 px-3 w-24 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/20">
                        <td className="py-2 px-3 text-center border-r border-slate-800">
                          <input type="checkbox" className="accent-amber-500 rounded" />
                        </td>
                        <td className="py-2 px-3 font-bold text-white">{item.name}</td>
                        <td className="py-2 px-3 text-slate-400">{item.piecePerBox}</td>
                        <td className="py-2 px-3 text-center font-black text-amber-400">
                          {item.quantity}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-400">₹{item.price}</td>
                        <td className="py-2 px-3 text-right font-bold text-white">
                          ₹{item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
              <div className="text-slate-400">
                Payment Method: <span className="text-white font-bold">{selectedOrder.paymentMethod}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 mr-2">Grand Total:</span>
                <span className="text-amber-400 font-black text-lg">
                  ₹{selectedOrder.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Transport Tracking / LR Number Updater */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 no-print">
              <label className="block text-slate-300 font-bold text-xs">
                Transport / Courier Tracking Number (LR No.)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="e.g. VRL-TRN-948212 or ABT-4819"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={handleSaveTracking}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {updatingStatus ? 'Saving...' : 'Save Tracking'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Transport LR / Consignment tracking number for records and customer WhatsApp updates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Professional Tax Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={invoiceOrder}
        storeSettings={storeSettings}
      />
    </div>
  );
};

export default AdminOrders;
