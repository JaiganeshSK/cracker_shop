const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Admin = require('../models/Admin');
const Setting = require('../models/Setting');
const connectDB = require('../config/db');

dotenv.config({ path: path.join(__dirname, '../.env') });

// Helper to generate a festive SVG banner converted to .webp for realistic seeding
async function generatePlaceholderWebP(name, category, color1, color2, filename) {
  const uploadDir = path.join(__dirname, '../uploads/products');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const escapeXml = (str) =>
    str.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });

  const safeCategory = escapeXml(category.toUpperCase());
  const safeName = escapeXml(name);

  const svg = `
    <svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
        <radialGradient id="sparkle" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
          <stop offset="60%" style="stop-color:#fbbf24;stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:0" />
        </radialGradient>
      </defs>
      <rect width="600" height="600" rx="32" fill="url(#grad)" />
      <circle cx="300" cy="220" r="160" fill="url(#sparkle)" />
      
      <!-- Sparkle stars -->
      <polygon points="300,140 310,190 360,200 310,210 300,260 290,210 240,200 290,190" fill="#ffffff" />
      <polygon points="180,100 185,125 210,130 185,135 180,160 175,135 150,130 175,125" fill="#fef08a" />
      <polygon points="420,120 425,145 450,150 425,155 420,180 415,155 390,150 415,145" fill="#fef08a" />

      <!-- Label Pill -->
      <rect x="100" y="380" width="400" height="44" rx="22" fill="#0f172a" fill-opacity="0.8" />
      <text x="300" y="408" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#f59e0b" text-anchor="middle" letter-spacing="2">
        ${safeCategory}
      </text>

      <!-- Product Title -->
      <text x="300" y="465" font-family="Arial, sans-serif" font-size="26" font-weight="bold" fill="#ffffff" text-anchor="middle">
        ${safeName}
      </text>
      <text x="300" y="505" font-family="Arial, sans-serif" font-size="18" fill="#fed7aa" text-anchor="middle">
        100% Genuine Sivakasi Green Cracker
      </text>
    </svg>
  `;

  const outputPath = path.join(uploadDir, filename);
  await sharp(Buffer.from(svg))
    .webp({ quality: 85 })
    .toFile(outputPath);

  return `/uploads/products/${filename}`;
}

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to MongoDB');

    // 1. Create Default Admin User
    await Admin.deleteMany({});
    const admin = new Admin({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'Pradhika@123',
      name: 'Super Admin',
      role: 'admin',
    });
    await admin.save();
    console.log(`[Seed] Created default admin: ${admin.username}`);

    // 2. Create Default Store Settings
    await Setting.deleteMany({});
    await Setting.create({
      shopName: 'Sri Krishna Fireworks Sivakasi',
      tagline: 'Direct Factory Outlet • 100% Certified Green Crackers',
      phone: '+91 94431 23456',
      whatsapp: '919443123456',
      email: 'sales@srikrishnafireworks.com',
      address: 'Shop No. 4, Factory By-Pass Road, Sivakasi, Tamil Nadu - 626123',
      minOrderValue: 3000,
      freeDeliveryAbove: 12000,
      defaultDeliveryFee: 250,
      announcementText: '💥 Diwali 2026 Mega Booking Open! Flat 80% Discount • Direct Factory Dispatch across India!',
      isAnnouncementActive: true,
      upiId: 'srikrishnafireworks@upi',
      upiQrUrl: '',
    });
    console.log('[Seed] Created store settings');

    // 3. Seed Category Master Records
    await Category.deleteMany({});
    const masterCategories = [
      { name: 'Sparklers', description: 'Electric, Gold, Colour, and Giant Neon Sparklers for family & kids', sortOrder: 1 },
      { name: 'Ground Chakkars', description: 'Fast circular spinning ground fireworks with gold and silver flares', sortOrder: 2 },
      { name: 'Flower Pots', description: 'Towering fountain eruption of multi-colored silver and ruby sparks', sortOrder: 3 },
      { name: 'Rockets & Missiles', description: 'High altitude aerial rockets with sound reports and whistles', sortOrder: 4 },
      { name: 'Fancy Aerial & Sky Shots', description: 'Multi-shot continuous repeaters and celebration sky cakes', sortOrder: 5 },
      { name: 'Single Sound Crackers', description: 'Traditional Sivakasi sound crackers, atom bombs, and garland laris', sortOrder: 6 },
      { name: 'Novelty & Kids Crackers', description: 'Low noise pop pops, color smoke fountains, and magic sparklers', sortOrder: 7 },
      { name: 'Gift Boxes & Combos', description: 'Mega family gift boxes and royal maharaja celebration packs', sortOrder: 8 },
    ];
    for (const cat of masterCategories) {
      await Category.create(cat);
    }
    console.log(`[Seed] Created ${masterCategories.length} Category Master records`);

    // 4. Generate Realistic Cracker Catalog
    await Product.deleteMany({});

    const productsData = [
      // SPARKLERS
      {
        name: '10 cm Electric Sparklers',
        category: 'Sparklers',
        description: 'Classic silver glittering sparks, safe and long burning for kids and family.',
        mrp: 180,
        price: 36,
        piecePerBox: '10 Pcs / Box',
        soundLevel: 'Silent / Visual',
        featured: true,
        c1: '#1e1b4b',
        c2: '#4338ca',
        file: 'sparklers-10cm.webp',
      },
      {
        name: '15 cm Colour Sparklers',
        category: 'Sparklers',
        description: 'Multi-colour vibrant sparkling fireworks in Red, Green, and Gold bursts.',
        mrp: 260,
        price: 52,
        piecePerBox: '10 Pcs / Box',
        soundLevel: 'Silent / Visual',
        featured: false,
        c1: '#831843',
        c2: '#be185d',
        file: 'sparklers-15cm.webp',
      },
      {
        name: '30 cm Special Gold Sparklers',
        category: 'Sparklers',
        description: 'Mega long lasting giant gold sparkle showers. Burn duration over 90 seconds.',
        mrp: 450,
        price: 90,
        piecePerBox: '5 Pcs / Box',
        soundLevel: 'Silent / Visual',
        featured: true,
        c1: '#78350f',
        c2: '#b45309',
        file: 'sparklers-30cm.webp',
      },
      {
        name: '50 cm Jumbo Neon Sparklers',
        category: 'Sparklers',
        description: 'Ultra-long festive handheld sparkles for stunning wedding and Diwali photos.',
        mrp: 750,
        price: 150,
        piecePerBox: '5 Pcs / Box',
        soundLevel: 'Silent / Visual',
        featured: false,
        c1: '#064e3b',
        c2: '#047857',
        file: 'sparklers-50cm.webp',
      },

      // GROUND CHAKKARS
      {
        name: 'Ground Chakkar Special',
        category: 'Ground Chakkars',
        description: 'High velocity ground spinning wheel emitting bright golden circular rings.',
        mrp: 240,
        price: 48,
        piecePerBox: '10 Pcs / Box',
        soundLevel: 'Silent / Visual',
        featured: true,
        c1: '#7c2d12',
        c2: '#c2410c',
        file: 'chakkar-special.webp',
      },
      {
        name: 'Ground Chakkar Deluxe Big',
        category: 'Ground Chakkars',
        description: 'Double rotation high speed spinner with vivid white and emerald spark flares.',
        mrp: 380,
        price: 76,
        piecePerBox: '10 Pcs / Box',
        soundLevel: 'Silent / Visual',
        featured: false,
        c1: '#701a75',
        c2: '#a21caf',
        file: 'chakkar-deluxe.webp',
      },
      {
        name: 'Wire Chakkar (Speed King)',
        category: 'Ground Chakkars',
        description: 'Unique wire-mounted spinning wheel with dazzling circular velocity.',
        mrp: 320,
        price: 64,
        piecePerBox: '10 Pcs / Box',
        soundLevel: 'Silent / Visual',
        featured: false,
        c1: '#14532d',
        c2: '#15803d',
        file: 'chakkar-wire.webp',
      },

      // FLOWER POTS
      {
        name: 'Flower Pots Special',
        category: 'Flower Pots',
        description: 'Graceful mid-height golden fountain shower with sparkling crackles.',
        mrp: 300,
        price: 60,
        piecePerBox: '10 Pcs / Box',
        soundLevel: 'Silent / Visual',
        featured: true,
        c1: '#1e293b',
        c2: '#334155',
        file: 'flowerpot-special.webp',
      },
      {
        name: 'Flower Pots Asoka / Giant',
        category: 'Flower Pots',
        description: 'Towering 15-feet fountain eruption of multi-colored silver and ruby sparks.',
        mrp: 520,
        price: 104,
        piecePerBox: '10 Pcs / Box',
        soundLevel: 'Silent / Visual',
        featured: true,
        c1: '#881337',
        c2: '#e11d48',
        file: 'flowerpot-giant.webp',
      },
      {
        name: 'Color Koti Fountain',
        category: 'Flower Pots',
        description: 'Changes 3 distinct colors during shower: Crimson Red to Emerald Green to Gold.',
        mrp: 650,
        price: 130,
        piecePerBox: '10 Pcs / Box',
        soundLevel: 'Silent / Visual',
        featured: false,
        c1: '#312e81',
        c2: '#4f46e5',
        file: 'flowerpot-colorkoti.webp',
      },

      // ROCKETS & MISSILES
      {
        name: 'Baby Rocket (Sound & Spark)',
        category: 'Rockets & Missiles',
        description: 'Fast aerial ascent with glittering golden tail and crisp report blast.',
        mrp: 290,
        price: 58,
        piecePerBox: '10 Pcs / Box',
        soundLevel: 'Loud Sound',
        featured: false,
        c1: '#0f172a',
        c2: '#dc2626',
        file: 'rocket-baby.webp',
      },
      {
        name: 'Whistling Bomb Rocket',
        category: 'Rockets & Missiles',
        description: 'High-pitch sonic whistling screech ascending 100 feet followed by thunderous burst.',
        mrp: 460,
        price: 92,
        piecePerBox: '10 Pcs / Box',
        soundLevel: 'Musical / Whistling',
        featured: true,
        c1: '#451a03',
        c2: '#d97706',
        file: 'rocket-whistling.webp',
      },
      {
        name: 'Lunik Parachute Rocket',
        category: 'Rockets & Missiles',
        description: 'Launches into high altitude, releases glowing flares and a floating mini parachute.',
        mrp: 680,
        price: 136,
        piecePerBox: '5 Pcs / Box',
        soundLevel: 'Mild Sound',
        featured: false,
        c1: '#022c22',
        c2: '#059669',
        file: 'rocket-parachute.webp',
      },

      // FANCY AERIAL & SKY SHOTS
      {
        name: '12 Shots Multi-Color Repeaters',
        category: 'Fancy Aerial & Sky Shots',
        description: '12 consecutive high-sky aerial bombs bursting into palm trees, brocades, and peonies.',
        mrp: 850,
        price: 170,
        piecePerBox: '1 Piece',
        soundLevel: 'Loud Sound',
        featured: true,
        c1: '#172554',
        c2: '#2563eb',
        file: 'aerial-12shots.webp',
      },
      {
        name: '30 Shots Sky King Symphony',
        category: 'Fancy Aerial & Sky Shots',
        description: 'Spectacular 30-shot continuous aerial fireworks show with crackling willow tails.',
        mrp: 2100,
        price: 420,
        piecePerBox: '1 Piece',
        soundLevel: 'Loud Sound',
        featured: true,
        c1: '#581c87',
        c2: '#9333ea',
        file: 'aerial-30shots.webp',
      },
      {
        name: '60 Shots Mega Celebration Cake',
        category: 'Fancy Aerial & Sky Shots',
        description: 'Professional grade grand finale aerial box. Illuminates the whole night sky.',
        mrp: 4500,
        price: 900,
        piecePerBox: '1 Piece',
        soundLevel: 'Loud Sound',
        featured: true,
        c1: '#701a75',
        c2: '#c026d3',
        file: 'aerial-60shots.webp',
      },
      {
        name: '7 cm Aerial Chhotta Fancy Ball',
        category: 'Fancy Aerial & Sky Shots',
        description: 'Single tube mortar sky shot exploding with sparkling brocade waterfall effect.',
        mrp: 350,
        price: 70,
        piecePerBox: '1 Piece',
        soundLevel: 'Musical / Whistling',
        featured: false,
        c1: '#1e3a5f',
        c2: '#0284c7',
        file: 'aerial-singleball.webp',
      },

      // SOUND CRACKERS
      {
        name: '2¾" Kuruvi Sound Crackers',
        category: 'Single Sound Crackers',
        description: 'Traditional crisp Sivakasi single sound crackers for festive morning pooja.',
        mrp: 120,
        price: 24,
        piecePerBox: '1 Packet',
        soundLevel: 'Loud Sound',
        featured: false,
        c1: '#7f1d1d',
        c2: '#ef4444',
        file: 'sound-kuruvi.webp',
      },
      {
        name: 'Hydro Green Atom Bomb',
        category: 'Single Sound Crackers',
        description: 'Supreme heavy blast sound bomb wrapped in green jute twine. High decibel resonance.',
        mrp: 380,
        price: 76,
        piecePerBox: '10 Pcs / Box',
        soundLevel: 'Loud Sound',
        featured: true,
        c1: '#14532d',
        c2: '#22c55e',
        file: 'sound-bomb.webp',
      },
      {
        name: '1000 Wala Festive Garland (Lari)',
        category: 'Single Sound Crackers',
        description: 'Continuous non-stop 1000 crackers roll with thunderous rolling beats and smoke.',
        mrp: 1400,
        price: 280,
        piecePerBox: '1 Roll',
        soundLevel: 'Loud Sound',
        featured: true,
        c1: '#831843',
        c2: '#f43f5e',
        file: 'sound-1000wala.webp',
      },

      // NOVELTY & KIDS CRACKERS
      {
        name: 'Electric Magic Wire Pops',
        category: 'Novelty & Kids Crackers',
        description: 'Zero heat, zero fire friction snapping pops. Fun and completely safe for toddlers.',
        mrp: 150,
        price: 30,
        piecePerBox: '50 Pcs / Box',
        soundLevel: 'Mild Sound',
        featured: false,
        c1: '#042f2e',
        c2: '#14b8a6',
        file: 'novelty-pops.webp',
      },
      {
        name: 'Colour Smoke Fountains (5 Colors)',
        category: 'Novelty & Kids Crackers',
        description: 'Vivid dense day-time photography smoke in Blue, Purple, Orange, Green, and Red.',
        mrp: 420,
        price: 84,
        piecePerBox: '5 Pcs / Box',
        soundLevel: 'Silent / Visual',
        featured: true,
        c1: '#3b0764',
        c2: '#a855f7',
        file: 'novelty-smoke.webp',
      },

      // GIFT BOXES & COMBOS
      {
        name: 'Diwali Sparkle Family Gift Box (25 Items)',
        category: 'Gift Boxes & Combos',
        description: 'Handpicked variety pack containing Sparklers, Chakkars, Flowerpots, and Novelty crackers.',
        mrp: 3200,
        price: 640,
        piecePerBox: '1 Deluxe Box',
        soundLevel: 'Musical / Whistling',
        featured: true,
        c1: '#4c0519',
        c2: '#f43f5e',
        file: 'combo-family25.webp',
      },
      {
        name: 'Royal Maharaja Mega Combo Box (45 Items)',
        category: 'Gift Boxes & Combos',
        description: 'Premium massive gift trunk packed with giant aerial sky shots, high power bombs, and sparklers.',
        mrp: 7500,
        price: 1500,
        piecePerBox: '1 VIP Trunk',
        soundLevel: 'Loud Sound',
        featured: true,
        c1: '#422006',
        c2: '#eab308',
        file: 'combo-maharaja45.webp',
      },
    ];

    console.log(`[Seed] Generating ${productsData.length} WebP product visuals & records...`);

    for (let i = 0; i < productsData.length; i++) {
      const item = productsData[i];
      const webpPath = await generatePlaceholderWebP(
        item.name,
        item.category,
        item.c1,
        item.c2,
        item.file
      );

      const discount = Math.round(((item.mrp - item.price) / item.mrp) * 100);

      const product = new Product({
        name: item.name,
        category: item.category,
        description: item.description,
        mrp: item.mrp,
        price: item.price,
        discountPercentage: discount,
        piecePerBox: item.piecePerBox,
        imageUrl: webpPath,
        soundLevel: item.soundLevel,
        inStock: true,
        featured: item.featured,
        sortOrder: i,
      });

      await product.save();
    }

    console.log(`[Seed] Successfully seeded ${productsData.length} products with WebP images!`);
    await mongoose.connection.close();
    console.log('[Seed] Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
