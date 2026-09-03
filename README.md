# 🧨 Sri Krishna Fireworks Sivakasi
### Modern Cracker E-Commerce Platform & Admin Management Portal

An end-to-end festive fireworks e-commerce platform and administrative management portal built with **Node.js, Express, MongoDB (`mongodb://127.0.0.1:27017/cracker_shop`), React 18, and Tailwind CSS**. Features automatic **WebP image conversion via Sharp**, a **Sivakasi-style bulk Quick Order / Price List sheet**, and turnkey **Linux VPS deployment configuration**.

---

## 🌟 Key Features

### 🛒 Customer Storefront
1. **Festive Modern UI ("Midnight Sparkle & Royal Gold")**:
   - Deep nocturnal background with amber, gold, and crimson accents.
   - Ultra-lightweight pure CSS particle sparkles and micro-interactions (60 FPS on mobile, zero CPU lag).
2. **Dual Ordering Experiences**:
   - **Visual Product Catalog**: Product cards with WebP packaging photos, decibel sound badges (`Silent/Visual`, `Mild`, `Loud`, `Musical`), pieces-per-box specs, and instant quantity steppers.
   - **High-Speed Quick Order Table**: Sivakasi-style wholesale tabular price list grouped by category with a sticky live calculation bar (`Items Count`, `Total Savings`, `Net Payable Amount`) and 1-click checkout.
3. **Smart Cart & Multi-channel Checkout**:
   - Slide-out Cart Drawer with dynamic minimum order value progress bar.
   - **1-Click WhatsApp Order Generator**: Formats a clean itemized receipt text ready to send to the shop's WhatsApp number.
   - **Web Checkout**: Full delivery address form, Cash on Delivery, and direct UPI QR payment option.
4. **Live Consignment Tracking**:
   - Track order pipeline with a 5-step visual timeline (`Placed` ➔ `Confirmed` ➔ `Packed` ➔ `Dispatched` ➔ `Delivered`) and transport LR docket lookup.
5. **Mobile-First UX**:
   - Fixed thumb-friendly bottom navigation bar (`Home`, `Catalog`, `Quick Order`, `Track`, `Cart`).

### 🛠️ Admin Management Portal
1. **Executive Dashboard**:
   - Real-time revenue metrics, total bookings, pending packing alerts, and low stock warnings.
2. **Product & Inventory Management with WebP Image Pipeline**:
   - Accepts JPG/PNG photos, auto-converts to **`.webp`** format via `sharp` (saving 70-85% file size for faster mobile loading).
   - Dynamic Price Calculator: Enter MRP + Discount % ➔ auto-computes Selling Price.
   - Quick **Stock Switch Toggle** right inside the inventory table.
3. **Order Pipeline & Printable Packing Slips**:
   - Status pipeline tabs (`All`, `Pending`, `Confirmed`, `Packed`, `Dispatched`, `Delivered`, `Cancelled`).
   - Detailed Order inspection drawer with customer address, contact details, and line-item packing checklist.
   - **1-Click Print Packing Slip / Invoice** formatted for thermal or standard A4 printers.
   - Transport LR / Docket number updater.
4. **Store Settings**:
   - Customize shop name, phone, WhatsApp number, minimum order limits, free delivery threshold, announcement bar marquee, and UPI ID.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** v20+ LTS
- **MongoDB** running locally on `mongodb://127.0.0.1:27017`

### 2. Backend Setup
```bash
cd server
npm install
npm run seed     # Populates 24 realistic crackers with WebP images & default admin
npm run dev      # Starts Express API on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

Open your browser:
- **Customer Storefront**: [http://localhost:5173](http://localhost:5173)
- **Quick Order Sheet**: [http://localhost:5173/quick-order](http://localhost:5173/quick-order)
- **Admin Portal**: [http://localhost:5173/admin](http://localhost:5173/admin)

### Default Admin Credentials:
- **Username**: `admin`
- **Password**: `admin123`

---

## 🌐 Linux VPS Production Deployment

The project includes production-ready assets in `deployment/`:
- **`deployment/nginx.conf`**: Pre-configured reverse proxy with WebP cache headers and 25M upload limits.
- **`deployment/deploy.sh`**: 1-command deployment script.
- **`deployment/vps-setup-guide.md`**: Complete step-by-step setup guide for Ubuntu/Debian VPS (Nginx, PM2, Certbot SSL).
- **`server/ecosystem.config.js`**: PM2 cluster mode configuration.

In production mode (`NODE_ENV=production`), the Express server automatically serves the compiled React frontend from `client/dist`, allowing single-port deployment behind Nginx!
