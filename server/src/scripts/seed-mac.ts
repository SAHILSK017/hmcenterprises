import "dotenv/config";
import { connectDB } from "../lib/db";
import { Product } from "../models/Product";

const MAC_PRODUCTS = [
  {
    name: 'Apple MacBook Air 13" M2 256GB',
    slug: "apple-macbook-air-13-m2-256gb",
    brand: "Apple",
    model: "MacBook Air M2",
    description:
      "Supercharged by the M2 chip, the redesigned MacBook Air combines incredible performance and up to 18 hours of battery life into its strikingly thin all-aluminum enclosure.",
    price: 89900,
    compareAtPrice: 99900,
    discountPercent: 10,
    condition: "new",
    productType: "mac",
    stock: 6,
    warrantyMonths: 12,
    batteryHealth: 100,
    sku: "APL-MBA-M2-256-MID",
    isFeatured: true,
    soldCount: 42,
    popularityScore: 950,
    highlights: [
      "Apple M2 chip with 8-core CPU and 8-core GPU",
      "13.6-inch Liquid Retina display with True Tone",
      "8GB unified memory, 256GB fast SSD storage",
      "MagSafe 3 charging, two Thunderbolt ports, headphone jack",
      "1080p FaceTime HD camera, four-speaker sound system",
      "Up to 18 hours battery life",
    ],
    offers: [
      "No-cost EMI from ₹7,490/month",
      "Exchange bonus up to ₹10,000 on old laptops",
      "Free premium laptop sleeve included",
    ],
    specifications: {
      storage: "256GB SSD",
      ram: "8GB",
      color: "Midnight",
      display: "13.6 inch Liquid Retina (2560 x 1664)",
      displayType: "Liquid Retina IPS",
      resolution: "2560 x 1664",
      refreshRate: "60Hz",
      processor: "Apple M2 (8-Core CPU)",
      gpu: "8-Core GPU, 16-Core Neural Engine",
      battery: "Up to 18 hours video playback",
      batteryCapacity: "52.6 Wh Lithium-polymer",
      charging: "30W USB-C, MagSafe 3",
      camera: "1080p FaceTime HD",
      os: "macOS Sonoma",
      wifi: "Wi-Fi 6 (802.11ax)",
      bluetooth: "5.3",
      usb: "Two Thunderbolt / USB 4 ports",
      weight: "1.24 kg",
      model: "MacBook Air 13-inch (M2)",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
        publicId: "seed-mba-m2-1",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
        publicId: "seed-mba-m2-2",
        isPrimary: false,
      },
    ],
    averageRating: 4.9,
    reviewCount: 38,
    ratingBreakdown: { five: 34, four: 3, three: 1, two: 0, one: 0 },
    reviews: [
      {
        name: "Vikram Singhania",
        rating: 5,
        title: "Incredible battery life and blazing fast",
        text: "The M2 MacBook Air is a dream machine for programming and daily work. Silent, cool, and battery lasts 2 full work days!",
        verified: true,
        helpful: 18,
      },
      {
        name: "Pooja Hegde",
        rating: 5,
        title: "Midnight color looks ultra premium",
        text: "Bought from HMC with genuine warranty. Pristine condition, sealed box, delivered in 24 hours.",
        verified: true,
        helpful: 9,
      },
    ],
  },
  {
    name: 'Apple MacBook Pro 14" M3 512GB',
    slug: "apple-macbook-pro-14-m3-512gb",
    brand: "Apple",
    model: "MacBook Pro 14 M3",
    description:
      "MacBook Pro 14-inch blasts forward with M3, an incredibly advanced chip that brings serious speed and capability. Liquid Retina XDR with 120Hz ProMotion and up to 22 hours of battery life.",
    price: 154900,
    compareAtPrice: 169900,
    discountPercent: 9,
    condition: "new",
    productType: "mac",
    stock: 4,
    warrantyMonths: 12,
    batteryHealth: 100,
    sku: "APL-MBP14-M3-512-SGY",
    isFeatured: true,
    soldCount: 29,
    popularityScore: 980,
    highlights: [
      "Apple M3 chip with 8-core CPU and 10-core GPU",
      "14.2-inch Liquid Retina XDR display (120Hz ProMotion)",
      "16GB Unified Memory, 512GB ultrafast SSD",
      "Industry-leading up to 22 hours battery life",
      "HDMI, SDXC card slot, MagSafe 3, two Thunderbolt ports",
      "Studio-quality three-mic array, six-speaker sound with Spatial Audio",
    ],
    offers: [
      "No-cost EMI available",
      "Flat ₹5,000 instant discount on HDFC / ICICI cards",
      "Comprehensive 1-year Apple care support",
    ],
    specifications: {
      storage: "512GB SSD",
      ram: "16GB",
      color: "Space Gray",
      display: "14.2 inch Liquid Retina XDR (3024 x 1964, 120Hz)",
      displayType: "Mini-LED Liquid Retina XDR",
      resolution: "3024 x 1964",
      refreshRate: "120Hz ProMotion",
      processor: "Apple M3 (8-Core CPU)",
      gpu: "10-Core GPU with Ray Tracing",
      battery: "Up to 22 hours video playback",
      batteryCapacity: "70 Wh Lithium-polymer",
      charging: "70W USB-C, MagSafe 3",
      camera: "1080p FaceTime HD",
      os: "macOS Sonoma",
      wifi: "Wi-Fi 6E (802.11ax)",
      bluetooth: "5.3",
      usb: "Two Thunderbolt / USB 4 ports, HDMI, SDXC",
      weight: "1.55 kg",
      model: "MacBook Pro 14-inch (M3)",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
        publicId: "seed-mbp14-1",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
        publicId: "seed-mbp14-2",
        isPrimary: false,
      },
    ],
    averageRating: 4.95,
    reviewCount: 22,
    ratingBreakdown: { five: 21, four: 1, three: 0, two: 0, one: 0 },
    reviews: [
      {
        name: "Arunav Sen",
        rating: 5,
        title: "Pro level performance for editing and dev",
        text: "The 120Hz XDR screen alone is worth every rupee. Exports 4K videos in seconds without breaking a sweat.",
        verified: true,
        helpful: 24,
      },
    ],
  },
  {
    name: 'Apple MacBook Air 13" M1 256GB (Certified Refurbished)',
    slug: "apple-macbook-air-13-m1-256gb-refurbished",
    brand: "Apple",
    model: "MacBook Air M1",
    description:
      "Certified refurbished Apple MacBook Air with Apple M1 chip. Thoroughly tested, cleaned, and verified by certified HMC hardware technicians. Outstanding battery life and silent operation.",
    price: 52999,
    compareAtPrice: 69900,
    discountPercent: 24,
    condition: "refurbished",
    productType: "mac",
    stock: 5,
    warrantyMonths: 6,
    batteryHealth: 94,
    sku: "APL-MBA-M1-256-REF",
    isFeatured: false,
    soldCount: 65,
    popularityScore: 910,
    highlights: [
      "HMC 45-point certified quality inspection passed",
      "Apple M1 chip with 8-core CPU and 7-core GPU",
      "8GB Unified Memory, 256GB SSD storage",
      "94% battery health, original Apple adapter included",
      "6 months comprehensive HMC replacement warranty",
    ],
    offers: [
      "Flat ₹2,000 exchange discount on any working laptop",
      "Free 30-day doorstep return guarantee",
    ],
    specifications: {
      storage: "256GB SSD",
      ram: "8GB",
      color: "Space Gray",
      display: "13.3 inch Retina display (2560 x 1600)",
      displayType: "Retina IPS",
      resolution: "2560 x 1600",
      refreshRate: "60Hz",
      processor: "Apple M1 (8-Core CPU)",
      gpu: "7-Core GPU, 16-Core Neural Engine",
      battery: "Up to 18 hours battery life",
      batteryCapacity: "49.9 Wh Lithium-polymer",
      charging: "30W USB-C",
      camera: "720p FaceTime HD",
      os: "macOS Sonoma",
      wifi: "Wi-Fi 6 (802.11ax)",
      bluetooth: "5.0",
      usb: "Two Thunderbolt / USB 4 ports",
      weight: "1.29 kg",
      model: "MacBook Air 13-inch (M1)",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80",
        publicId: "seed-mba-m1-1",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
        publicId: "seed-mba-m1-2",
        isPrimary: false,
      },
    ],
    averageRating: 4.8,
    reviewCount: 45,
    ratingBreakdown: { five: 38, four: 5, three: 2, two: 0, one: 0 },
    reviews: [
      {
        name: "Harish Murthy",
        rating: 5,
        title: "Looks brand new at half the price!",
        text: "Not a single scratch on the body or screen. Battery health is at 94% as advertised. Best purchase I made this year.",
        verified: true,
        helpful: 15,
      },
    ],
  },
  {
    name: 'Apple iMac 24" M3 256GB',
    slug: "apple-imac-24-m3-256gb",
    brand: "Apple",
    model: "iMac 24 M3",
    description:
      "The world's best all-in-one computer, now supercharged by the M3 chip. Featuring a gorgeous 24-inch 4.5K Retina display in an iconic 11.5mm thin design with studio-quality mics and 6-speaker sound system.",
    price: 124900,
    compareAtPrice: 134900,
    discountPercent: 7,
    condition: "new",
    productType: "mac",
    stock: 3,
    warrantyMonths: 12,
    batteryHealth: 100,
    sku: "APL-IMAC24-M3-BLU",
    isFeatured: true,
    soldCount: 18,
    popularityScore: 890,
    highlights: [
      "Stunning 24-inch 4.5K Retina display (4480 x 2520, 500 nits)",
      "Apple M3 chip with 8-core CPU and 8-core GPU",
      "Strikingly thin 11.5mm all-in-one design in vibrant Blue",
      "1080p FaceTime HD camera with studio-quality 3-mic array",
      "Six-speaker sound system with Spatial Audio",
      "Color-matched Magic Keyboard and Magic Mouse included",
    ],
    offers: [
      "No-cost EMI up to 12 months",
      "Includes color-matched Magic Keyboard and Magic Mouse",
    ],
    specifications: {
      storage: "256GB SSD",
      ram: "8GB",
      color: "Blue",
      display: "24 inch 4.5K Retina (4480 x 2520, 500 nits)",
      displayType: "4.5K Retina IPS with P3 wide color",
      resolution: "4480 x 2520",
      refreshRate: "60Hz",
      processor: "Apple M3 (8-Core CPU)",
      gpu: "8-Core GPU",
      charging: "143W power adapter with integrated Gigabit Ethernet",
      camera: "1080p FaceTime HD with M3 ISP",
      os: "macOS Sonoma",
      wifi: "Wi-Fi 6E (802.11ax)",
      bluetooth: "5.3",
      usb: "Two Thunderbolt / USB 4 ports",
      weight: "4.43 kg",
      model: "iMac 24-inch (M3)",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
        publicId: "seed-imac-1",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
        publicId: "seed-imac-2",
        isPrimary: false,
      },
    ],
    averageRating: 4.88,
    reviewCount: 16,
    ratingBreakdown: { five: 14, four: 2, three: 0, two: 0, one: 0 },
    reviews: [
      {
        name: "Shreya Ghoshal",
        rating: 5,
        title: "Stunning desk centerpiece with tremendous speed",
        text: "The 4.5K display is crystal sharp for photo editing and general use. Sound quality is shockingly good for how thin it is.",
        verified: true,
        helpful: 12,
      },
    ],
  },
];

async function run() {
  await connectDB();
  console.log("Connected to MongoDB. Seeding Mac products...");

  for (const item of MAC_PRODUCTS) {
    const existing = await Product.findOne({ slug: item.slug });
    if (existing) {
      await Product.updateOne({ slug: item.slug }, { $set: item });
      console.log(`Updated Mac product: ${item.name}`);
    } else {
      await Product.create(item);
      console.log(`Created Mac product: ${item.name}`);
    }
  }

  console.log("Mac products seeded successfully!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
