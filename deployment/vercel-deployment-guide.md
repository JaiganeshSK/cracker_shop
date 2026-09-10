# Vercel Deployment Guide
## Festive Cracker E-Commerce Platform & Admin Portal

This guide provides step-by-step instructions to deploy the application on **Vercel**.

---

### Key Serverless Concept
> [!NOTE]
> Vercel runs backend code as **Serverless Functions** (ephemeral containers) and hosts the React frontend on a **Global Edge CDN**.
> - **Database**: You cannot use `localhost:27017` on Vercel. You must use a free cloud database like **MongoDB Atlas**.
> - **File Uploads**: Serverless lambdas have a read-only filesystem (except temporary `/tmp`). For persistent image uploads in production, use direct image URLs, external image hosting (e.g., Cloudinary), or deploy the backend on a VPS / Render.

---

### Step 1: Set Up Free Cloud MongoDB (MongoDB Atlas)

1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas) (Free Forever M0 Tier).
2. Create a **Shared Cluster (M0)** (Free).
3. Under **Security > Database Access**:
   - Click **Add New Database User**.
   - Set Authentication Method to **Password** (e.g., username: `cracker_admin`, password: `YourStrongPassword123`).
   - Assign Role: **Read and write to any database**.
4. Under **Security > Network Access**:
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere (`0.0.0.0/0`)** (Required because Vercel uses dynamic serverless IP ranges).
5. Under **Deployments > Database**:
   - Click **Connect** > **Drivers** (Node.js).
   - Copy your connection string:
     ```
     mongodb+srv://cracker_admin:<password>@cluster0.abcde.mongodb.net/cracker_shop?retryWrites=true&w=majority
     ```
   *(Remember to replace `<password>` with your actual password and ensure `/cracker_shop` database name is included!)*

---

### Step 2: Seed Initial Data into MongoDB Atlas

Before deploying, populate your remote MongoDB database with initial cracker categories, products, and the default admin account from your computer:

1. Open your terminal in the `server` directory:
   ```bash
   cd server
   ```
2. Run the seed command with your MongoDB Atlas URI:
   - On Windows (PowerShell):
     ```powershell
     $env:MONGODB_URI="mongodb+srv://cracker_admin:YourPassword@cluster0.abcde.mongodb.net/cracker_shop?retryWrites=true&w=majority"; npm run seed
     ```
   - On Linux / Mac:
     ```bash
     MONGODB_URI="mongodb+srv://cracker_admin:YourPassword@cluster0.abcde.mongodb.net/cracker_shop?retryWrites=true&w=majority" npm run seed
     ```
3. You will see:
   ```
   ✅ Catalog database seeded successfully!
   Admin credentials:
     Username: admin
     Password: Pradhika@123
   ```

---

### Step 3: Push Your Code to GitHub

Make sure your latest code is committed and pushed to GitHub:
```bash
git add .
git commit -m "Configure Vercel deployment and serverless database support"
git push origin main
```

---

### Step 4: Deploy on Vercel (Unified 1-Click Project)

The project includes a root `vercel.json` pre-configured to build the Vite client and run the Express API as a serverless function together.

1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New...** > **Project**.
3. Select your GitHub repository and click **Import**.
4. Leave **Root Directory** as `./` (Project Root).
5. Open the **Environment Variables** section and add:

   | Variable Name | Value |
   |---|---|
   | `MONGODB_URI` | `mongodb+srv://cracker_admin:YourPassword@cluster0.abcde.mongodb.net/cracker_shop?retryWrites=true&w=majority` |
   | `JWT_SECRET` | `generate_any_random_secure_string_here_diwali_2026` |
   | `NODE_ENV` | `production` |

6. Click **Deploy**!
7. Vercel will build your React application and deploy your API routes. In 1–2 minutes, your website will be live at `https://your-project.vercel.app`!

---

### Step 5: Test Your Live Deployment

1. **Storefront**: Visit `https://your-project.vercel.app` to browse categories, products, cart drawer, and order inquiry flow.
2. **API Health**: Visit `https://your-project.vercel.app/api/health` — it should return:
   ```json
   { "status": "online", "service": "Cracker Shop API" }
   ```
3. **Admin Portal**: Visit `https://your-project.vercel.app/admin/login`
   - **Username**: `admin`
   - **Password**: `Pradhika@123`

---

### Alternative: Deploy Frontend and Backend Separately

If you prefer keeping Express on an always-on server (like Render, Railway, or VPS) for persistent image uploads:

1. **Deploy Backend (Render / VPS)**:
   - Deploy `server/` using the instructions in `deployment/vps-setup-guide.md` or Render Web Service.
   - Note the backend URL (e.g. `https://api.yourdomain.com` or `https://cracker-api.onrender.com`).
2. **Deploy Frontend on Vercel**:
   - In Vercel, set **Root Directory** to `client`.
   - Add Environment Variable:
     - `VITE_API_BASE_URL` = `https://cracker-api.onrender.com/api`
   - Deploy!
