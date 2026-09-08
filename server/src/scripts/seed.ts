import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../lib/db";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { Category, Brand } from "../models/Category";
import { RepairRequest } from "../models/RepairRequest";
import { SellRequest } from "../models/SellRequest";
import { BlogPost, BlogCategory } from "../models/Blog";
import { SiteSettings } from "../models/SiteSettings";
import { slugify } from "../lib/utils";

type Condition = "new" | "refurbished" | "used_like_new" | "used_good" | "used_fair";
type ProductType = "new" | "used" | "refurbished" | "accessory";
type SeedProduct = {
  name: string;
  slug: string;
  brand: string;
  model: string;
  description: string;
  price: number;
  compareAtPrice: number;
  condition: Condition;
  productType: ProductType;
  stock: number;
  warrantyMonths: number;
  batteryHealth?: number;
  sku: string;
  isFeatured?: boolean;
  soldCount: number;
  popularityScore: number;
  specifications: {
    storage: string;
    ram: string;
    color: string;
    display: string;
    displayType: string;
    resolution: string;
    refreshRate: string;
    processor: string;
    gpu: string;
    battery: string;
    batteryCapacity: string;
    charging: string;
    camera: string;
    rearCamera: string;
    frontCamera: string;
    videoRecording: string;
    os: string;
    expandableStorage: string;
    network5g: string;
    network4g: string;
    wifi: string;
    bluetooth: string;
    nfc: string;
    usb: string;
    height: string;
    width: string;
    thickness: string;
    weight: string;
    releaseYear: string;
    model: string;
  };
  deviceCondition?: {
    display: string;
    body: string;
    camera: string;
    speaker: string;
    charging: string;
    originalParts: boolean;
    boxAvailable: boolean;
    chargerAvailable: boolean;
    billAvailable: boolean;
  };
  imageUrls: [string, string];
  highlights: string[];
  offers: string[];
  averageRating: number;
  reviewCount: number;
  ratingBreakdown: { five: number; four: number; three: number; two: number; one: number };
  reviews: Array<{
    name: string;
    rating: number;
    title: string;
    text: string;
    verified: boolean;
    helpful: number;
  }>;
  questions: Array<{
    question: string;
    answer: string;
    askedBy: string;
    answeredBy: string;
  }>;
  availableColors: string[];
  availableStorage: string[];
  availableRam: string[];
  deliveryInfo: string;
  returnPolicy: string;
};

const SELLER = {
  name: "HMC Mobile Store",
  rating: 4.7,
  ratingCount: 2840,
  verified: true,
  location: "India",
  sinceYear: 2019,
  productsSold: 12000,
  returnPolicy: "7-day replacement on manufacturing defects",
  warrantyNote: "HMC warranty as listed on product",
};

const PRODUCTS: SeedProduct[] = [
  {
    name: "Apple iPhone 15 128GB",
    slug: "apple-iphone-15-128gb",
    brand: "Apple",
    model: "iPhone 15",
    description:
      "Brand-new sealed iPhone 15 with A16 Bionic, Dynamic Island, and USB-C. Full manufacturer warranty included.",
    price: 69999,
    compareAtPrice: 79900,
    condition: "new",
    productType: "new",
    stock: 5,
    warrantyMonths: 12,
    batteryHealth: 100,
    sku: "APL-IP15-128-BLK",
    isFeatured: true,
    soldCount: 86,
    popularityScore: 920,
    specifications: {
      storage: "128GB",
      ram: "6GB",
      color: "Black",
      display: "6.1 inch Super Retina XDR",
      displayType: "OLED",
      resolution: "2556 x 1179",
      refreshRate: "60Hz",
      processor: "A16 Bionic",
      gpu: "5-core Apple GPU",
      battery: "Up to 20 hours video playback",
      batteryCapacity: "3349 mAh",
      charging: "20W wired, MagSafe wireless",
      camera: "48MP Dual",
      rearCamera: "48MP main + 12MP ultrawide",
      frontCamera: "12MP TrueDepth",
      videoRecording: "4K@60fps",
      os: "iOS 17",
      expandableStorage: "No",
      network5g: "Yes",
      network4g: "LTE",
      wifi: "Wi-Fi 6",
      bluetooth: "5.3",
      nfc: "Yes",
      usb: "USB-C",
      height: "147.6 mm",
      width: "71.6 mm",
      thickness: "7.8 mm",
      weight: "171 g",
      releaseYear: "2023",
      model: "iPhone 15",
    },
    imageUrls: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80",
    ],
    highlights: [
      "Sealed pack with full Apple warranty",
      "Dynamic Island & USB-C",
      "48MP main camera",
      "A16 Bionic performance",
    ],
    offers: ["Free tempered glass", "No-cost EMI available", "Exchange bonus up to ₹5,000"],
    averageRating: 4.8,
    reviewCount: 42,
    ratingBreakdown: { five: 34, four: 6, three: 2, two: 0, one: 0 },
    reviews: [
      {
        name: "Rahul Mehta",
        rating: 5,
        title: "Genuine sealed unit",
        text: "Received a sealed iPhone 15. Activation and Face ID worked perfectly. Fast delivery from HMC.",
        verified: true,
        helpful: 18,
      },
      {
        name: "Sneha Kapoor",
        rating: 5,
        title: "Camera is excellent",
        text: "Photos in low light are sharp. Packaging was premium and invoice was included.",
        verified: true,
        helpful: 11,
      },
      {
        name: "Arjun Nair",
        rating: 4,
        title: "Worth the deal",
        text: "Slightly better price than big box stores. Setup was smooth.",
        verified: true,
        helpful: 7,
      },
    ],
    questions: [
      {
        question: "Is this an Indian variant with dual SIM?",
        answer: "Yes, this is an India dual-physical SIM model.",
        askedBy: "Priya S",
        answeredBy: "HMC Support",
      },
      {
        question: "Does it include AppleCare+?",
        answer: "No, it includes standard 1-year manufacturer warranty. AppleCare+ can be purchased separately.",
        askedBy: "Vikram R",
        answeredBy: "HMC Support",
      },
    ],
    availableColors: ["Black", "Blue", "Pink", "Green", "Yellow"],
    availableStorage: ["128GB", "256GB", "512GB"],
    availableRam: ["6GB"],
    deliveryInfo: "Usually ships in 1–2 business days across India",
    returnPolicy: "7-day replacement on manufacturing defects",
  },
  {
    name: "Apple iPhone 13 128GB",
    slug: "apple-iphone-13-128gb",
    brand: "Apple",
    model: "iPhone 13",
    description:
      "Fully tested refurbished iPhone 13. Battery health verified, Face ID working, 6-month HMC warranty.",
    price: 39999,
    compareAtPrice: 45999,
    condition: "refurbished",
    productType: "refurbished",
    stock: 4,
    warrantyMonths: 6,
    batteryHealth: 92,
    sku: "APL-IP13-128-MDN",
    isFeatured: true,
    soldCount: 124,
    popularityScore: 880,
    specifications: {
      storage: "128GB",
      ram: "4GB",
      color: "Midnight",
      display: "6.1 inch Super Retina XDR",
      displayType: "OLED",
      resolution: "2532 x 1170",
      refreshRate: "60Hz",
      processor: "A15 Bionic",
      gpu: "4-core Apple GPU",
      battery: "Up to 19 hours video playback",
      batteryCapacity: "3240 mAh",
      charging: "20W wired, MagSafe wireless",
      camera: "12MP Dual",
      rearCamera: "12MP main + 12MP ultrawide",
      frontCamera: "12MP TrueDepth",
      videoRecording: "4K@60fps",
      os: "iOS 17",
      expandableStorage: "No",
      network5g: "Yes",
      network4g: "LTE",
      wifi: "Wi-Fi 6",
      bluetooth: "5.0",
      nfc: "Yes",
      usb: "Lightning",
      height: "146.7 mm",
      width: "71.5 mm",
      thickness: "7.65 mm",
      weight: "174 g",
      releaseYear: "2021",
      model: "iPhone 13",
    },
    deviceCondition: {
      display: "Excellent — no burn-in",
      body: "Minor micro-scratches on frame",
      camera: "Fully functional",
      speaker: "Clear audio",
      charging: "Working normally",
      originalParts: true,
      boxAvailable: true,
      chargerAvailable: false,
      billAvailable: false,
    },
    imageUrls: [
      "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
    ],
    highlights: [
      "Battery health 92%",
      "Factory-grade refurbish process",
      "A15 Bionic still feels fast",
      "6-month HMC warranty",
    ],
    offers: ["Free screen protector", "Open-box accessory kit", "Exchange available"],
    averageRating: 4.6,
    reviewCount: 67,
    ratingBreakdown: { five: 42, four: 18, three: 5, two: 1, one: 1 },
    reviews: [
      {
        name: "Deepak Sharma",
        rating: 5,
        title: "Looks almost new",
        text: "Battery lasts a full day. Screen and Face ID are perfect. Great refurbished pick.",
        verified: true,
        helpful: 24,
      },
      {
        name: "Ananya Iyer",
        rating: 4,
        title: "Solid daily driver",
        text: "Tiny mark on the side frame but overall excellent condition for the price.",
        verified: true,
        helpful: 9,
      },
    ],
    questions: [
      {
        question: "Is Face ID working?",
        answer: "Yes, Face ID and TrueDepth camera are fully tested and working.",
        askedBy: "Karan D",
        answeredBy: "HMC Support",
      },
    ],
    availableColors: ["Midnight", "Blue", "Starlight", "Pink"],
    availableStorage: ["128GB", "256GB"],
    availableRam: ["4GB"],
    deliveryInfo: "Usually ships in 1–2 business days",
    returnPolicy: "7-day replacement on manufacturing defects",
  },
  {
    name: "Apple iPhone 12 64GB",
    slug: "apple-iphone-12-64gb",
    brand: "Apple",
    model: "iPhone 12",
    description:
      "Used iPhone 12 in like-new condition. Minor hairline marks only. Clean device history, ready to activate.",
    price: 27999,
    compareAtPrice: 31999,
    condition: "used_like_new",
    productType: "used",
    stock: 3,
    warrantyMonths: 3,
    batteryHealth: 88,
    sku: "APL-IP12-64-BLU",
    soldCount: 58,
    popularityScore: 710,
    specifications: {
      storage: "64GB",
      ram: "4GB",
      color: "Blue",
      display: "6.1 inch Super Retina XDR",
      displayType: "OLED",
      resolution: "2532 x 1170",
      refreshRate: "60Hz",
      processor: "A14 Bionic",
      gpu: "4-core Apple GPU",
      battery: "Up to 17 hours video playback",
      batteryCapacity: "2815 mAh",
      charging: "20W wired, MagSafe wireless",
      camera: "12MP Dual",
      rearCamera: "12MP main + 12MP ultrawide",
      frontCamera: "12MP TrueDepth",
      videoRecording: "4K@60fps",
      os: "iOS 17",
      expandableStorage: "No",
      network5g: "Yes",
      network4g: "LTE",
      wifi: "Wi-Fi 6",
      bluetooth: "5.0",
      nfc: "Yes",
      usb: "Lightning",
      height: "146.7 mm",
      width: "71.5 mm",
      thickness: "7.4 mm",
      weight: "164 g",
      releaseYear: "2020",
      model: "iPhone 12",
    },
    deviceCondition: {
      display: "Near perfect",
      body: "Hairline marks on edges only",
      camera: "Working",
      speaker: "Working",
      charging: "Working",
      originalParts: true,
      boxAvailable: false,
      chargerAvailable: false,
      billAvailable: false,
    },
    imageUrls: [
      "https://images.unsplash.com/photo-1603891128711-11b4b03bb138?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80",
    ],
    highlights: [
      "Like-new cosmetics",
      "Battery health 88%",
      "5G ready",
      "3-month HMC warranty",
    ],
    offers: ["Free case", "Data transfer help in-store"],
    averageRating: 4.4,
    reviewCount: 31,
    ratingBreakdown: { five: 16, four: 11, three: 3, two: 1, one: 0 },
    reviews: [
      {
        name: "Neha Gupta",
        rating: 5,
        title: "Clean unit",
        text: "Looks barely used. Performance is snappy for everyday apps and calls.",
        verified: true,
        helpful: 14,
      },
      {
        name: "Imran Ali",
        rating: 4,
        title: "Good value",
        text: "Storage is tight at 64GB but phone itself is excellent.",
        verified: true,
        helpful: 6,
      },
      {
        name: "Pooja Reddy",
        rating: 4,
        title: "Trusted seller",
        text: "HMC checked everything before shipping. Happy with the purchase.",
        verified: true,
        helpful: 5,
      },
    ],
    questions: [
      {
        question: "Can I upgrade storage later?",
        answer: "No, iPhone storage is not expandable. Consider 128GB if you need more space.",
        askedBy: "Suresh K",
        answeredBy: "HMC Support",
      },
    ],
    availableColors: ["Blue", "Black", "White", "Green", "Red"],
    availableStorage: ["64GB", "128GB"],
    availableRam: ["4GB"],
    deliveryInfo: "Usually ships in 1–2 business days",
    returnPolicy: "7-day replacement on manufacturing defects",
  },
  {
    name: "Samsung Galaxy S24 256GB",
    slug: "samsung-galaxy-s24-256gb",
    brand: "Samsung",
    model: "Galaxy S24",
    description:
      "New Galaxy S24 with Galaxy AI features, bright Dynamic AMOLED display, and long battery life.",
    price: 74999,
    compareAtPrice: 79999,
    condition: "new",
    productType: "new",
    stock: 4,
    warrantyMonths: 12,
    batteryHealth: 100,
    sku: "SAM-S24-256-OBL",
    isFeatured: true,
    soldCount: 73,
    popularityScore: 905,
    specifications: {
      storage: "256GB",
      ram: "8GB",
      color: "Onyx Black",
      display: "6.2 inch Dynamic AMOLED 2X",
      displayType: "Dynamic AMOLED 2X",
      resolution: "2340 x 1080",
      refreshRate: "120Hz",
      processor: "Snapdragon 8 Gen 3",
      gpu: "Adreno 750",
      battery: "All-day battery with adaptive power",
      batteryCapacity: "4000 mAh",
      charging: "25W wired, 15W wireless",
      camera: "50MP Triple",
      rearCamera: "50MP main + 12MP ultrawide + 10MP telephoto",
      frontCamera: "12MP",
      videoRecording: "8K@30fps / 4K@60fps",
      os: "Android 14",
      expandableStorage: "No",
      network5g: "Yes",
      network4g: "LTE",
      wifi: "Wi-Fi 6E",
      bluetooth: "5.3",
      nfc: "Yes",
      usb: "USB-C",
      height: "147.0 mm",
      width: "70.6 mm",
      thickness: "7.6 mm",
      weight: "167 g",
      releaseYear: "2024",
      model: "Galaxy S24",
    },
    imageUrls: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519cf0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
    ],
    highlights: [
      "Galaxy AI features",
      "120Hz Dynamic AMOLED",
      "Snapdragon 8 Gen 3",
      "Sealed with full warranty",
    ],
    offers: ["Samsung Care+ discount", "Free earbuds pouch", "No-cost EMI"],
    averageRating: 4.7,
    reviewCount: 55,
    ratingBreakdown: { five: 38, four: 12, three: 4, two: 1, one: 0 },
    reviews: [
      {
        name: "Harshit Jain",
        rating: 5,
        title: "AI features are useful",
        text: "Circle to Search and call translate work great. Display is bright outdoors.",
        verified: true,
        helpful: 21,
      },
      {
        name: "Meera Joshi",
        rating: 5,
        title: "Compact flagship",
        text: "Perfect size for one-hand use. Battery easily lasts a day.",
        verified: true,
        helpful: 13,
      },
    ],
    questions: [
      {
        question: "Is this the Snapdragon or Exynos variant?",
        answer: "This India unit is Snapdragon 8 Gen 3.",
        askedBy: "Aditya P",
        answeredBy: "HMC Support",
      },
      {
        question: "Does it support Samsung DeX?",
        answer: "Yes, DeX is supported over USB-C and wireless.",
        askedBy: "Ritu M",
        answeredBy: "HMC Support",
      },
    ],
    availableColors: ["Onyx Black", "Marble Gray", "Cobalt Violet", "Amber Yellow"],
    availableStorage: ["128GB", "256GB"],
    availableRam: ["8GB"],
    deliveryInfo: "Usually ships in 1–2 business days",
    returnPolicy: "7-day replacement on manufacturing defects",
  },
  {
    name: "Samsung Galaxy S22 128GB",
    slug: "samsung-galaxy-s22",
    brand: "Samsung",
    model: "Galaxy S22",
    description:
      "Quality-checked Galaxy S22 in excellent working condition. Camera and charging fully tested.",
    price: 32999,
    compareAtPrice: 36999,
    condition: "used_like_new",
    productType: "used",
    stock: 3,
    warrantyMonths: 3,
    batteryHealth: 90,
    sku: "SAM-S22-128-PHB",
    soldCount: 91,
    popularityScore: 760,
    specifications: {
      storage: "128GB",
      ram: "8GB",
      color: "Phantom Black",
      display: "6.1 inch Dynamic AMOLED 2X",
      displayType: "Dynamic AMOLED 2X",
      resolution: "2340 x 1080",
      refreshRate: "120Hz",
      processor: "Snapdragon 8 Gen 1",
      gpu: "Adreno 730",
      battery: "Solid all-day with adaptive refresh",
      batteryCapacity: "3700 mAh",
      charging: "25W wired, 15W wireless",
      camera: "50MP Triple",
      rearCamera: "50MP main + 12MP ultrawide + 10MP telephoto",
      frontCamera: "10MP",
      videoRecording: "8K@24fps / 4K@60fps",
      os: "Android 14",
      expandableStorage: "No",
      network5g: "Yes",
      network4g: "LTE",
      wifi: "Wi-Fi 6E",
      bluetooth: "5.2",
      nfc: "Yes",
      usb: "USB-C",
      height: "146.0 mm",
      width: "70.6 mm",
      thickness: "7.6 mm",
      weight: "167 g",
      releaseYear: "2022",
      model: "Galaxy S22",
    },
    deviceCondition: {
      display: "Excellent",
      body: "Very light wear on corners",
      camera: "Fully functional",
      speaker: "Clear",
      charging: "Fast charging verified",
      originalParts: true,
      boxAvailable: true,
      chargerAvailable: true,
      billAvailable: false,
    },
    imageUrls: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1610945265064-0e34e5519cf0?auto=format&fit=crop&w=800&q=80",
    ],
    highlights: [
      "Like-new condition",
      "120Hz AMOLED",
      "Battery health 90%",
      "Flagship camera system",
    ],
    offers: ["Free case", "Screen guard included"],
    averageRating: 4.5,
    reviewCount: 44,
    ratingBreakdown: { five: 26, four: 13, three: 4, two: 1, one: 0 },
    reviews: [
      {
        name: "Sanjay Rao",
        rating: 5,
        title: "Camera still shines",
        text: "Night mode and zoom are impressive. Phone feels premium in hand.",
        verified: true,
        helpful: 17,
      },
      {
        name: "Kavitha S",
        rating: 4,
        title: "Great mid-budget flagship",
        text: "Battery is decent with 90% health. No issues after a week of use.",
        verified: true,
        helpful: 8,
      },
    ],
    questions: [
      {
        question: "Is wireless charging supported?",
        answer: "Yes, 15W wireless charging is supported.",
        askedBy: "Nitin B",
        answeredBy: "HMC Support",
      },
    ],
    availableColors: ["Phantom Black", "Phantom White", "Green"],
    availableStorage: ["128GB", "256GB"],
    availableRam: ["8GB"],
    deliveryInfo: "Usually ships in 1–2 business days",
    returnPolicy: "7-day replacement on manufacturing defects",
  },
  {
    name: "Samsung Galaxy A54 128GB",
    slug: "samsung-galaxy-a54-128gb",
    brand: "Samsung",
    model: "Galaxy A54",
    description:
      "Refurbished Galaxy A54 — smooth 120Hz display, solid mid-range camera, great daily driver.",
    price: 21999,
    compareAtPrice: 25999,
    condition: "refurbished",
    productType: "refurbished",
    stock: 6,
    warrantyMonths: 6,
    batteryHealth: 94,
    sku: "SAM-A54-128-AWE",
    soldCount: 110,
    popularityScore: 800,
    specifications: {
      storage: "128GB",
      ram: "8GB",
      color: "Awesome Violet",
      display: "6.4 inch Super AMOLED",
      displayType: "Super AMOLED",
      resolution: "2340 x 1080",
      refreshRate: "120Hz",
      processor: "Exynos 1380",
      gpu: "Mali-G68 MP5",
      battery: "Long-lasting mid-range battery",
      batteryCapacity: "5000 mAh",
      charging: "25W wired",
      camera: "50MP Triple",
      rearCamera: "50MP main + 12MP ultrawide + 5MP macro",
      frontCamera: "32MP",
      videoRecording: "4K@30fps",
      os: "Android 14",
      expandableStorage: "microSD up to 1TB",
      network5g: "Yes",
      network4g: "LTE",
      wifi: "Wi-Fi 6",
      bluetooth: "5.3",
      nfc: "Yes",
      usb: "USB-C",
      height: "158.2 mm",
      width: "76.7 mm",
      thickness: "8.2 mm",
      weight: "202 g",
      releaseYear: "2023",
      model: "Galaxy A54",
    },
    deviceCondition: {
      display: "Excellent",
      body: "Light polishing marks",
      camera: "Working",
      speaker: "Working",
      charging: "Working",
      originalParts: true,
      boxAvailable: true,
      chargerAvailable: true,
      billAvailable: false,
    },
    imageUrls: [
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    ],
    highlights: [
      "5000 mAh battery",
      "120Hz Super AMOLED",
      "IP67 rating",
      "6-month refurbished warranty",
    ],
    offers: ["microSD card 64GB free", "Open-box accessories"],
    averageRating: 4.3,
    reviewCount: 39,
    ratingBreakdown: { five: 18, four: 14, three: 5, two: 1, one: 1 },
    reviews: [
      {
        name: "Rohit Verma",
        rating: 4,
        title: "Best mid-range pick",
        text: "Display and battery are the stars. Perfect for students.",
        verified: true,
        helpful: 12,
      },
      {
        name: "Shalini Das",
        rating: 5,
        title: "Looks brand new",
        text: "Refurbish quality is impressive. Selfie camera is good too.",
        verified: true,
        helpful: 10,
      },
      {
        name: "Amit Patel",
        rating: 4,
        title: "Reliable daily phone",
        text: "No lag in WhatsApp, Instagram, or light gaming.",
        verified: true,
        helpful: 4,
      },
    ],
    questions: [
      {
        question: "Does it support microSD?",
        answer: "Yes, expandable storage up to 1TB via microSD.",
        askedBy: "Farhan Q",
        answeredBy: "HMC Support",
      },
    ],
    availableColors: ["Awesome Violet", "Awesome Graphite", "Awesome Lime"],
    availableStorage: ["128GB", "256GB"],
    availableRam: ["6GB", "8GB"],
    deliveryInfo: "Usually ships in 1–2 business days",
    returnPolicy: "7-day replacement on manufacturing defects",
  },
  {
    name: "OnePlus 12R 256GB",
    slug: "oneplus-12r-256gb",
    brand: "OnePlus",
    model: "12R",
    description:
      "Near-new OnePlus 12R with 120Hz AMOLED and fast charging. Light desk use only.",
    price: 35999,
    compareAtPrice: 42999,
    condition: "used_like_new",
    productType: "used",
    stock: 2,
    warrantyMonths: 3,
    batteryHealth: 96,
    sku: "OP-12R-256-IRN",
    isFeatured: true,
    soldCount: 64,
    popularityScore: 845,
    specifications: {
      storage: "256GB",
      ram: "16GB",
      color: "Iron Gray",
      display: "6.78 inch LTPO AMOLED",
      displayType: "LTPO AMOLED",
      resolution: "2780 x 1264",
      refreshRate: "120Hz",
      processor: "Snapdragon 8 Gen 2",
      gpu: "Adreno 740",
      battery: "Flagship endurance with SUPERVOOC",
      batteryCapacity: "5500 mAh",
      charging: "100W SUPERVOOC",
      camera: "50MP Triple",
      rearCamera: "50MP main + 8MP ultrawide + 2MP macro",
      frontCamera: "16MP",
      videoRecording: "4K@60fps",
      os: "OxygenOS 14",
      expandableStorage: "No",
      network5g: "Yes",
      network4g: "LTE",
      wifi: "Wi-Fi 7",
      bluetooth: "5.3",
      nfc: "Yes",
      usb: "USB-C",
      height: "163.3 mm",
      width: "75.3 mm",
      thickness: "8.8 mm",
      weight: "207 g",
      releaseYear: "2024",
      model: "12R",
    },
    deviceCondition: {
      display: "Perfect — no scratches",
      body: "Near mint",
      camera: "Fully functional",
      speaker: "Dual speakers clear",
      charging: "100W charging verified",
      originalParts: true,
      boxAvailable: true,
      chargerAvailable: true,
      billAvailable: true,
    },
    imageUrls: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80",
    ],
    highlights: [
      "16GB RAM",
      "100W SUPERVOOC charging",
      "120Hz LTPO AMOLED",
      "Like-new with original box",
    ],
    offers: ["Original 100W charger included", "Free case"],
    averageRating: 4.6,
    reviewCount: 28,
    ratingBreakdown: { five: 18, four: 8, three: 2, two: 0, one: 0 },
    reviews: [
      {
        name: "Yash Thakur",
        rating: 5,
        title: "Charges insanely fast",
        text: "0 to full in under half an hour. Gaming stays cool enough for sessions.",
        verified: true,
        helpful: 19,
      },
      {
        name: "Divya Menon",
        rating: 4,
        title: "Clean OxygenOS",
        text: "Software is smooth. Camera is good in daylight.",
        verified: true,
        helpful: 7,
      },
    ],
    questions: [
      {
        question: "Is the 100W charger included?",
        answer: "Yes, original SUPERVOOC charger and cable are included with this unit.",
        askedBy: "Gaurav L",
        answeredBy: "HMC Support",
      },
      {
        question: "Does it support wireless charging?",
        answer: "No, OnePlus 12R does not support wireless charging.",
        askedBy: "Ishita C",
        answeredBy: "HMC Support",
      },
    ],
    availableColors: ["Iron Gray", "Cool Blue"],
    availableStorage: ["128GB", "256GB"],
    availableRam: ["8GB", "16GB"],
    deliveryInfo: "Usually ships in 1–2 business days",
    returnPolicy: "7-day replacement on manufacturing defects",
  },
  {
    name: "Xiaomi 14 256GB",
    slug: "xiaomi-14-256gb",
    brand: "Xiaomi",
    model: "14",
    description:
      "Flagship Xiaomi 14 in good used condition. Leica optics, Snapdragon 8 Gen 3, clean body.",
    price: 44999,
    compareAtPrice: 54999,
    condition: "used_good",
    productType: "used",
    stock: 2,
    warrantyMonths: 3,
    batteryHealth: 87,
    sku: "MI-14-256-BLK",
    soldCount: 47,
    popularityScore: 730,
    specifications: {
      storage: "256GB",
      ram: "12GB",
      color: "Black",
      display: "6.36 inch LTPO AMOLED",
      displayType: "LTPO AMOLED",
      resolution: "2670 x 1200",
      refreshRate: "120Hz",
      processor: "Snapdragon 8 Gen 3",
      gpu: "Adreno 750",
      battery: "Compact flagship endurance",
      batteryCapacity: "4610 mAh",
      charging: "90W wired, 50W wireless",
      camera: "50MP Leica Triple",
      rearCamera: "50MP main + 50MP ultrawide + 50MP telephoto",
      frontCamera: "32MP",
      videoRecording: "8K@24fps / 4K@60fps",
      os: "HyperOS",
      expandableStorage: "No",
      network5g: "Yes",
      network4g: "LTE",
      wifi: "Wi-Fi 7",
      bluetooth: "5.4",
      nfc: "Yes",
      usb: "USB-C",
      height: "152.8 mm",
      width: "71.5 mm",
      thickness: "8.2 mm",
      weight: "193 g",
      releaseYear: "2024",
      model: "14",
    },
    deviceCondition: {
      display: "Good — no dead pixels",
      body: "Visible light scratches on back glass",
      camera: "Leica lenses clean and working",
      speaker: "Working",
      charging: "90W charging verified",
      originalParts: true,
      boxAvailable: false,
      chargerAvailable: true,
      billAvailable: false,
    },
    imageUrls: [
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
    ],
    highlights: [
      "Leica triple camera",
      "Snapdragon 8 Gen 3",
      "90W fast charging",
      "Compact flagship form",
    ],
    offers: ["Free clear case", "Screen protector applied"],
    averageRating: 4.4,
    reviewCount: 22,
    ratingBreakdown: { five: 11, four: 8, three: 2, two: 1, one: 0 },
    reviews: [
      {
        name: "Tanvi Shah",
        rating: 5,
        title: "Leica color science",
        text: "Photos look natural and detailed. HyperOS is snappy after setup.",
        verified: true,
        helpful: 15,
      },
      {
        name: "Manish Yadav",
        rating: 4,
        title: "Good used deal",
        text: "Back has light marks as described, but overall a strong flagship.",
        verified: true,
        helpful: 6,
      },
    ],
    questions: [
      {
        question: "Is IR blaster available?",
        answer: "Yes, Xiaomi 14 includes an IR blaster.",
        askedBy: "Leena F",
        answeredBy: "HMC Support",
      },
    ],
    availableColors: ["Black", "White", "Jade Green"],
    availableStorage: ["256GB", "512GB"],
    availableRam: ["12GB"],
    deliveryInfo: "Usually ships in 1–2 business days",
    returnPolicy: "7-day replacement on manufacturing defects",
  },
  {
    name: "Google Pixel 8 128GB",
    slug: "google-pixel-8-128gb",
    brand: "Google",
    model: "Pixel 8",
    description:
      "Refurbished Pixel 8 with clean Tensor G3 performance and best-in-class computational photography.",
    price: 42999,
    compareAtPrice: 49999,
    condition: "refurbished",
    productType: "refurbished",
    stock: 3,
    warrantyMonths: 6,
    batteryHealth: 93,
    sku: "GOOG-P8-128-OBS",
    soldCount: 52,
    popularityScore: 790,
    specifications: {
      storage: "128GB",
      ram: "8GB",
      color: "Obsidian",
      display: "6.2 inch Actua OLED",
      displayType: "OLED",
      resolution: "2400 x 1080",
      refreshRate: "120Hz",
      processor: "Google Tensor G3",
      gpu: "Immortalis-G715s MC10",
      battery: "Adaptive Battery for all-day use",
      batteryCapacity: "4575 mAh",
      charging: "27W wired, wireless charging",
      camera: "50MP Dual",
      rearCamera: "50MP main + 12MP ultrawide",
      frontCamera: "10.5MP",
      videoRecording: "4K@60fps",
      os: "Android 14",
      expandableStorage: "No",
      network5g: "Yes",
      network4g: "LTE",
      wifi: "Wi-Fi 7",
      bluetooth: "5.3",
      nfc: "Yes",
      usb: "USB-C",
      height: "150.5 mm",
      width: "70.8 mm",
      thickness: "8.9 mm",
      weight: "187 g",
      releaseYear: "2023",
      model: "Pixel 8",
    },
    deviceCondition: {
      display: "Excellent",
      body: "Professionally cleaned, minor frame wear",
      camera: "Magic Editor & Night Sight verified",
      speaker: "Working",
      charging: "Working",
      originalParts: true,
      boxAvailable: true,
      chargerAvailable: false,
      billAvailable: false,
    },
    imageUrls: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80",
    ],
    highlights: [
      "Best computational photography",
      "7 years of OS updates",
      "Clean Tensor G3 experience",
      "6-month HMC warranty",
    ],
    offers: ["Google One trial tip sheet", "Free case"],
    averageRating: 4.7,
    reviewCount: 36,
    ratingBreakdown: { five: 24, four: 9, three: 2, two: 1, one: 0 },
    reviews: [
      {
        name: "Aisha Khan",
        rating: 5,
        title: "Pixel photos win",
        text: "Portrait and Night Sight are unmatched at this price. Software is clean.",
        verified: true,
        helpful: 22,
      },
      {
        name: "Joseph Abraham",
        rating: 5,
        title: "Trusted refurb",
        text: "Battery health 93% and no issues with fingerprint or face unlock.",
        verified: true,
        helpful: 11,
      },
      {
        name: "Rhea Mathew",
        rating: 4,
        title: "Great for photography",
        text: "Slight heating during long video calls, otherwise excellent.",
        verified: true,
        helpful: 5,
      },
    ],
    questions: [
      {
        question: "How many years of updates left?",
        answer: "Pixel 8 is eligible for OS and security updates through 2030.",
        askedBy: "Nikhil T",
        answeredBy: "HMC Support",
      },
    ],
    availableColors: ["Obsidian", "Hazel", "Rose"],
    availableStorage: ["128GB", "256GB"],
    availableRam: ["8GB"],
    deliveryInfo: "Usually ships in 1–2 business days",
    returnPolicy: "7-day replacement on manufacturing defects",
  },
  {
    name: "Vivo V29 128GB",
    slug: "vivo-v29-128gb",
    brand: "Vivo",
    model: "V29",
    description:
      "Used Vivo V29 in fair cosmetic condition — perfect if you want a bright AMOLED and selfie camera on a budget.",
    price: 18999,
    compareAtPrice: 24999,
    condition: "used_fair",
    productType: "used",
    stock: 2,
    warrantyMonths: 1,
    batteryHealth: 82,
    sku: "VIVO-V29-128-RED",
    soldCount: 35,
    popularityScore: 620,
    specifications: {
      storage: "128GB",
      ram: "8GB",
      color: "Red",
      display: "6.78 inch AMOLED",
      displayType: "AMOLED",
      resolution: "2800 x 1260",
      refreshRate: "120Hz",
      processor: "Snapdragon 778G",
      gpu: "Adreno 642L",
      battery: "Solid mid-range endurance",
      batteryCapacity: "4600 mAh",
      charging: "80W FlashCharge",
      camera: "50MP Triple",
      rearCamera: "50MP main + 8MP ultrawide + 2MP depth",
      frontCamera: "50MP",
      videoRecording: "4K@30fps",
      os: "Funtouch OS 13",
      expandableStorage: "No",
      network5g: "Yes",
      network4g: "LTE",
      wifi: "Wi-Fi 6",
      bluetooth: "5.2",
      nfc: "Yes",
      usb: "USB-C",
      height: "164.2 mm",
      width: "74.4 mm",
      thickness: "7.5 mm",
      weight: "186 g",
      releaseYear: "2023",
      model: "V29",
    },
    deviceCondition: {
      display: "Good — minor wear at edges",
      body: "Noticeable scratches and scuffs",
      camera: "Working",
      speaker: "Working",
      charging: "80W charging verified",
      originalParts: true,
      boxAvailable: false,
      chargerAvailable: true,
      billAvailable: false,
    },
    imageUrls: [
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=800&q=80",
    ],
    highlights: [
      "50MP selfie camera",
      "120Hz AMOLED",
      "80W FlashCharge",
      "Budget-friendly used deal",
    ],
    offers: ["Charger included", "Extra discount on case"],
    averageRating: 4.1,
    reviewCount: 18,
    ratingBreakdown: { five: 7, four: 6, three: 4, two: 1, one: 0 },
    reviews: [
      {
        name: "Sana Sheikh",
        rating: 4,
        title: "Selfies are great",
        text: "Cosmetics are fair as listed, but camera and display still impress.",
        verified: true,
        helpful: 8,
      },
      {
        name: "Prakash N",
        rating: 4,
        title: "Good for the price",
        text: "Charges very fast. Fine for social media and calls.",
        verified: true,
        helpful: 3,
      },
    ],
    questions: [
      {
        question: "Is the color changing glass still working?",
        answer: "Yes, the color-changing rear panel reacts to light as designed.",
        askedBy: "Maya R",
        answeredBy: "HMC Support",
      },
      {
        question: "Any dead pixels?",
        answer: "No dead pixels found during inspection.",
        askedBy: "Omar H",
        answeredBy: "HMC Support",
      },
    ],
    availableColors: ["Red", "Black", "Blue"],
    availableStorage: ["128GB", "256GB"],
    availableRam: ["8GB", "12GB"],
    deliveryInfo: "Usually ships in 1–2 business days",
    returnPolicy: "7-day replacement on manufacturing defects",
  },
  {
    name: "Realme GT 6 256GB",
    slug: "realme-gt-6-256gb",
    brand: "Realme",
    model: "GT 6",
    description:
      "Performance-focused Realme GT 6, lightly used. Fast charging, bright display, gaming-ready.",
    price: 29999,
    compareAtPrice: 35999,
    condition: "used_good",
    productType: "used",
    stock: 3,
    warrantyMonths: 3,
    batteryHealth: 89,
    sku: "RLM-GT6-256-SLV",
    soldCount: 41,
    popularityScore: 700,
    specifications: {
      storage: "256GB",
      ram: "12GB",
      color: "Silver",
      display: "6.78 inch LTPO AMOLED",
      displayType: "LTPO AMOLED",
      resolution: "2780 x 1264",
      refreshRate: "120Hz",
      processor: "Snapdragon 8s Gen 3",
      gpu: "Adreno 735",
      battery: "High endurance with rapid top-ups",
      batteryCapacity: "5500 mAh",
      charging: "120W SUPERVOOC",
      camera: "50MP Triple",
      rearCamera: "50MP main + 8MP ultrawide + 2MP macro",
      frontCamera: "32MP",
      videoRecording: "4K@60fps",
      os: "realme UI 5",
      expandableStorage: "No",
      network5g: "Yes",
      network4g: "LTE",
      wifi: "Wi-Fi 6",
      bluetooth: "5.3",
      nfc: "Yes",
      usb: "USB-C",
      height: "162.0 mm",
      width: "75.1 mm",
      thickness: "8.7 mm",
      weight: "199 g",
      releaseYear: "2024",
      model: "GT 6",
    },
    deviceCondition: {
      display: "Good",
      body: "Light desk wear on sides",
      camera: "Working",
      speaker: "Working",
      charging: "120W charging verified",
      originalParts: true,
      boxAvailable: true,
      chargerAvailable: true,
      billAvailable: false,
    },
    imageUrls: [
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80",
    ],
    highlights: [
      "Snapdragon 8s Gen 3",
      "120W SUPERVOOC",
      "Bright LTPO AMOLED",
      "Gaming-ready performance",
    ],
    offers: ["Cooling case offer", "Free screen guard"],
    averageRating: 4.5,
    reviewCount: 25,
    ratingBreakdown: { five: 14, four: 8, three: 2, two: 1, one: 0 },
    reviews: [
      {
        name: "Kunal Bose",
        rating: 5,
        title: "Beast for gaming",
        text: "BGMI stays smooth. Display is bright and charging is ridiculous.",
        verified: true,
        helpful: 16,
      },
      {
        name: "Nisha Agarwal",
        rating: 4,
        title: "Value monster",
        text: "Used condition is honest. Performance punches above the price.",
        verified: true,
        helpful: 7,
      },
    ],
    questions: [
      {
        question: "Does it heat while gaming?",
        answer: "Mild warmth under load is normal; sustained peak gaming may warm the frame.",
        askedBy: "Dev S",
        answeredBy: "HMC Support",
      },
    ],
    availableColors: ["Silver", "Green"],
    availableStorage: ["256GB", "512GB"],
    availableRam: ["12GB", "16GB"],
    deliveryInfo: "Usually ships in 1–2 business days",
    returnPolicy: "7-day replacement on manufacturing defects",
  },
  {
    name: "Nothing Phone (2) 256GB",
    slug: "nothing-phone-2-256gb",
    brand: "Nothing",
    model: "Phone (2)",
    description:
      "Like-new Nothing Phone (2) with Glyph interface. Transparent design, clean software experience.",
    price: 34999,
    compareAtPrice: 39999,
    condition: "used_like_new",
    productType: "used",
    stock: 2,
    warrantyMonths: 3,
    batteryHealth: 95,
    sku: "NTH-P2-256-WHT",
    soldCount: 39,
    popularityScore: 750,
    specifications: {
      storage: "256GB",
      ram: "12GB",
      color: "White",
      display: "6.7 inch LTPO OLED",
      displayType: "LTPO OLED",
      resolution: "2412 x 1080",
      refreshRate: "120Hz",
      processor: "Snapdragon 8+ Gen 1",
      gpu: "Adreno 730",
      battery: "All-day with Glyph-friendly standby",
      batteryCapacity: "4700 mAh",
      charging: "45W wired, 15W wireless",
      camera: "50MP Dual",
      rearCamera: "50MP main + 50MP ultrawide",
      frontCamera: "32MP",
      videoRecording: "4K@60fps",
      os: "Nothing OS 2.5",
      expandableStorage: "No",
      network5g: "Yes",
      network4g: "LTE",
      wifi: "Wi-Fi 6",
      bluetooth: "5.3",
      nfc: "Yes",
      usb: "USB-C",
      height: "162.1 mm",
      width: "76.4 mm",
      thickness: "8.6 mm",
      weight: "201.2 g",
      releaseYear: "2023",
      model: "Phone (2)",
    },
    deviceCondition: {
      display: "Excellent",
      body: "Near mint transparent back",
      camera: "Working",
      speaker: "Stereo speakers clear",
      charging: "Wired and wireless verified",
      originalParts: true,
      boxAvailable: true,
      chargerAvailable: false,
      billAvailable: true,
    },
    imageUrls: [
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    ],
    highlights: [
      "Glyph Interface LED",
      "Clean Nothing OS",
      "12GB RAM",
      "Like-new with original box",
    ],
    offers: ["Glyph tips card included", "Free clear case"],
    averageRating: 4.6,
    reviewCount: 27,
    ratingBreakdown: { five: 17, four: 8, three: 2, two: 0, one: 0 },
    reviews: [
      {
        name: "Chris D'Souza",
        rating: 5,
        title: "Unique design",
        text: "Glyph lights are actually useful for notifications. Software feels premium.",
        verified: true,
        helpful: 20,
      },
      {
        name: "Lavanya Krishnan",
        rating: 5,
        title: "Almost new",
        text: "Looks unused. Battery and cameras checked out perfectly.",
        verified: true,
        helpful: 9,
      },
      {
        name: "Farid Hussain",
        rating: 4,
        title: "Fun daily phone",
        text: "Camera is good enough. Design stands out in a sea of same phones.",
        verified: true,
        helpful: 4,
      },
    ],
    questions: [
      {
        question: "Is Glyph Interface working?",
        answer: "Yes, all Glyph zones were tested and work with Nothing OS.",
        askedBy: "Elena V",
        answeredBy: "HMC Support",
      },
      {
        question: "Wireless charging included?",
        answer: "The phone supports 15W wireless charging. A wireless pad is not included.",
        askedBy: "Samir J",
        answeredBy: "HMC Support",
      },
    ],
    availableColors: ["White", "Dark Grey"],
    availableStorage: ["128GB", "256GB", "512GB"],
    availableRam: ["8GB", "12GB"],
    deliveryInfo: "Usually ships in 1–2 business days",
    returnPolicy: "7-day replacement on manufacturing defects",
  },
  {
    name: "Apple 20W USB-C Power Adapter",
    slug: "apple-20w-usbc-adapter",
    brand: "Apple",
    model: "20W USB-C Adapter",
    description: "Genuine-style fast charger compatible with iPhone USB-C models. Compact and travel-ready.",
    price: 1499,
    compareAtPrice: 1900,
    condition: "new",
    productType: "accessory",
    stock: 25,
    warrantyMonths: 6,
    sku: "ACC-APL-20W",
    isFeatured: true,
    soldCount: 420,
    popularityScore: 910,
    specifications: {
      storage: "—",
      ram: "—",
      color: "White",
      display: "—",
      displayType: "—",
      resolution: "—",
      refreshRate: "—",
      processor: "—",
      gpu: "—",
      battery: "—",
      batteryCapacity: "—",
      charging: "20W USB-C PD",
      camera: "—",
      rearCamera: "—",
      frontCamera: "—",
      videoRecording: "—",
      os: "—",
      expandableStorage: "—",
      network5g: "—",
      network4g: "—",
      wifi: "—",
      bluetooth: "—",
      nfc: "—",
      usb: "USB-C",
      height: "—",
      width: "—",
      thickness: "—",
      weight: "46g",
      releaseYear: "2024",
      model: "20W USB-C Adapter",
    },
    imageUrls: [
      "https://images.unsplash.com/photo-1583863789084-4b18cd2a2df5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80",
    ],
    highlights: ["20W fast charging", "USB-C Power Delivery", "Compact foldable pins", "6 Months Warranty"],
    offers: ["Combo offer with cable", "Free delivery above ₹999"],
    averageRating: 4.5,
    reviewCount: 318,
    ratingBreakdown: { five: 210, four: 70, three: 25, two: 8, one: 5 },
    reviews: [
      {
        name: "Ravi Nair",
        rating: 5,
        title: "Charges fast",
        text: "Works perfectly with iPhone 15. Solid build.",
        verified: true,
        helpful: 12,
      },
    ],
    questions: [
      {
        question: "Works with Android too?",
        answer: "Yes, any USB-C PD compatible phone.",
        askedBy: "Customer",
        answeredBy: "HMC Support",
      },
    ],
    availableColors: ["White"],
    availableStorage: [],
    availableRam: [],
    deliveryInfo: "Usually ships in 1 business day",
    returnPolicy: "7-day replacement on manufacturing defects",
  },
  {
    name: "Spigen Tough Armor Case (Universal Fit)",
    slug: "spigen-tough-armor-case",
    brand: "Spigen",
    model: "Tough Armor",
    description: "Dual-layer protection case with kickstand. Shock-absorbing design for daily drops.",
    price: 1299,
    compareAtPrice: 1999,
    condition: "new",
    productType: "accessory",
    stock: 40,
    warrantyMonths: 3,
    sku: "ACC-SPG-TA",
    soldCount: 510,
    popularityScore: 880,
    specifications: {
      storage: "—",
      ram: "—",
      color: "Black",
      display: "—",
      displayType: "—",
      resolution: "—",
      refreshRate: "—",
      processor: "—",
      gpu: "—",
      battery: "—",
      batteryCapacity: "—",
      charging: "Wireless charging compatible",
      camera: "—",
      rearCamera: "—",
      frontCamera: "—",
      videoRecording: "—",
      os: "—",
      expandableStorage: "—",
      network5g: "—",
      network4g: "—",
      wifi: "—",
      bluetooth: "—",
      nfc: "—",
      usb: "—",
      height: "—",
      width: "—",
      thickness: "—",
      weight: "—",
      releaseYear: "2024",
      model: "Tough Armor",
    },
    imageUrls: [
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=800&q=80",
    ],
    highlights: ["Military-grade drop protection", "Built-in kickstand", "Raised camera bezel", "3 Months Warranty"],
    offers: ["Buy 2 get 10% off", "Free delivery above ₹999"],
    averageRating: 4.4,
    reviewCount: 204,
    ratingBreakdown: { five: 120, four: 55, three: 20, two: 6, one: 3 },
    reviews: [
      {
        name: "Sneha Patel",
        rating: 5,
        title: "Very sturdy",
        text: "Feels premium and the stand is useful for videos.",
        verified: true,
        helpful: 8,
      },
    ],
    questions: [
      {
        question: "Fits iPhone 13?",
        answer: "Confirm model size at checkout — we stock popular iPhone/Samsung fits.",
        askedBy: "Customer",
        answeredBy: "HMC Support",
      },
    ],
    availableColors: ["Black", "Navy"],
    availableStorage: [],
    availableRam: [],
    deliveryInfo: "Usually ships in 1 business day",
    returnPolicy: "7-day replacement on manufacturing defects",
  },
  {
    name: "boAt Airdopes 141 TWS Earbuds",
    slug: "boat-airdopes-141",
    brand: "boAt",
    model: "Airdopes 141",
    description: "Wireless earbuds with up to 42 hours playback, ASAP charge, and immersive audio.",
    price: 999,
    compareAtPrice: 2990,
    condition: "new",
    productType: "accessory",
    stock: 60,
    warrantyMonths: 12,
    sku: "ACC-BOAT-141",
    isFeatured: true,
    soldCount: 980,
    popularityScore: 960,
    specifications: {
      storage: "—",
      ram: "—",
      color: "Black",
      display: "—",
      displayType: "—",
      resolution: "—",
      refreshRate: "—",
      processor: "—",
      gpu: "—",
      battery: "42 hours playback",
      batteryCapacity: "—",
      charging: "Type-C ASAP Charge",
      camera: "—",
      rearCamera: "—",
      frontCamera: "—",
      videoRecording: "—",
      os: "—",
      expandableStorage: "—",
      network5g: "—",
      network4g: "—",
      wifi: "—",
      bluetooth: "Bluetooth 5.1",
      nfc: "—",
      usb: "Type-C",
      height: "—",
      width: "—",
      thickness: "—",
      weight: "—",
      releaseYear: "2023",
      model: "Airdopes 141",
    },
    imageUrls: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=80",
    ],
    highlights: ["42H playback", "ASAP Charge", "IPX4 sweat resistance", "1 Year Warranty"],
    offers: ["Bank offer 5% off", "Free delivery"],
    averageRating: 4.3,
    reviewCount: 1250,
    ratingBreakdown: { five: 700, four: 350, three: 140, two: 40, one: 20 },
    reviews: [
      {
        name: "Amit Shah",
        rating: 4,
        title: "Value for money",
        text: "Bass is strong and battery lasts long for the price.",
        verified: true,
        helpful: 22,
      },
    ],
    questions: [
      {
        question: "Mic quality for calls?",
        answer: "Clear for daily calls; not studio quality.",
        askedBy: "Customer",
        answeredBy: "HMC Support",
      },
    ],
    availableColors: ["Black", "White", "Blue"],
    availableStorage: [],
    availableRam: [],
    deliveryInfo: "Usually ships in 1 business day",
    returnPolicy: "7-day replacement on manufacturing defects",
  },
];

function productImages(urls: [string, string], slug: string) {
  return [
    { url: urls[0], publicId: `seed/${slug}-1`, isPrimary: true },
    { url: urls[1], publicId: `seed/${slug}-2`, isPrimary: false },
  ];
}

function discountPercent(price: number, compareAtPrice: number) {
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

async function seed() {
  await connectDB();

  const admin = await User.findOneAndUpdate(
    { email: "admin@hmkmobile.in" },
    {
      name: "HMK Admin",
      email: "admin@hmkmobile.in",
      phone: "9876543210",
      passwordHash: await bcrypt.hash("Admin@123", 12),
      role: "admin",
      isActive: true,
    },
    { upsert: true, new: true }
  );

  const SEED_CATEGORIES = [
    { name: "Phone", slug: "phone", description: "Brand-new sealed smartphones with full manufacturer warranty." },
    { name: "Old Phone", slug: "old-phone", description: "Certified pre-owned and refurbished smartphones thoroughly inspected." },
    { name: "Accessories", slug: "accessories", description: "Chargers, cases, cables, adapters, and audio accessories." },
    { name: "Mac", slug: "mac", description: "Apple MacBooks, iMacs, and Mac desktops." },
  ];

  const catMap = new Map<string, any>();
  for (const c of SEED_CATEGORIES) {
    const doc = await Category.findOneAndUpdate({ slug: c.slug }, { $set: c }, { upsert: true, new: true });
    catMap.set(c.slug, doc);
  }

  const SEED_BRANDS = [
    { name: "Apple", slug: "apple" },
    { name: "Samsung", slug: "samsung" },
    { name: "OnePlus", slug: "oneplus" },
    { name: "Google", slug: "google" },
    { name: "Xiaomi", slug: "xiaomi" },
    { name: "Realme", slug: "realme" },
    { name: "Vivo", slug: "vivo" },
    { name: "Oppo", slug: "oppo" },
    { name: "Nothing", slug: "nothing" },
    { name: "boAt", slug: "boat" },
    { name: "Spigen", slug: "spigen" },
    { name: "Motorola", slug: "motorola" },
  ];

  for (const b of SEED_BRANDS) {
    await Brand.findOneAndUpdate({ slug: b.slug }, { $set: b }, { upsert: true, new: true });
  }

  for (const product of PRODUCTS) {
    let assignedCategory = catMap.get("phone")?._id;
    if (product.productType === ("mac" as any) || /mac|imac/i.test(product.name)) {
      assignedCategory = catMap.get("mac")?._id;
    } else if (product.productType === "accessory") {
      assignedCategory = catMap.get("accessories")?._id;
    } else if (product.condition !== "new" || product.productType === "used") {
      assignedCategory = catMap.get("old-phone")?._id;
    }

    await Product.findOneAndUpdate(
      { slug: product.slug },
      {
        name: product.name,
        slug: product.slug,
        category: assignedCategory,
        brand: product.brand,
        model: product.model,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        discountPercent: discountPercent(product.price, product.compareAtPrice),
        condition: product.condition,
        productType: product.productType,
        stock: product.stock,
        warrantyMonths: product.warrantyMonths,
        ...(typeof product.batteryHealth === "number" ? { batteryHealth: product.batteryHealth } : {}),
        specifications: product.specifications,
        ...(product.deviceCondition ? { deviceCondition: product.deviceCondition } : {}),
        images: productImages(product.imageUrls, product.slug),
        highlights: product.highlights,
        offers: product.offers,
        seller: SELLER,
        averageRating: product.averageRating,
        reviewCount: product.reviewCount,
        ratingBreakdown: product.ratingBreakdown,
        reviews: product.reviews,
        questions: product.questions,
        availableColors: product.availableColors,
        availableStorage: product.availableStorage,
        availableRam: product.availableRam,
        deliveryInfo: product.deliveryInfo,
        returnPolicy: product.returnPolicy,
        sku: product.sku,
        isFeatured: Boolean(product.isFeatured),
        isActive: true,
        soldCount: product.soldCount,
        popularityScore: product.popularityScore,
      },
      { upsert: true, new: true }
    );
  }

  const demoImage = productImages(
    [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80",
    ],
    "hmk-demo"
  )[0];

  await RepairRequest.findOneAndUpdate(
    { repairId: "REP-DEMO01" },
    {
      repairId: "REP-DEMO01",
      name: "Demo Customer",
      phone: "9876543211",
      brand: "Apple",
      model: "iPhone 13",
      problemCategory: "screen",
      problemDescription: "Screen has cracks after an accidental drop.",
      status: "diagnosis",
      diagnosis: "Display assembly needs replacement.",
      images: [{ url: demoImage.url, publicId: demoImage.publicId }],
      assignedTo: admin._id,
    },
    { upsert: true }
  );

  await SellRequest.findOneAndUpdate(
    { sellId: "SELL-DEMO01" },
    {
      sellId: "SELL-DEMO01",
      name: "Demo Seller",
      phone: "9876543212",
      brand: "Samsung",
      model: "Galaxy S22",
      storage: "128GB",
      ram: "8GB",
      overallCondition: "good",
      checklist: {
        screen: "minor_scratches",
        battery: "good",
        body: "minor_wear",
        camera: "working",
        charging: "working",
        accessories: [],
        billAvailable: false,
        warrantyValid: false,
      },
      images: [{ url: demoImage.url, publicId: demoImage.publicId }],
      status: "price_offered",
      offers: [
        {
          amount: 18000,
          note: "Subject to final quality inspection",
          offeredBy: admin._id,
        },
      ],
    },
    { upsert: true }
  );

  await SiteSettings.findOneAndUpdate(
    { key: "main" },
    {
      key: "main",
      yearsExperience: 5,
      showPublicStats: true,
      workshopNote:
        "Our technicians diagnose carefully, use quality parts, and test every device before return.",
    },
    { upsert: true }
  );

  const BLOG_CATEGORIES = [
    "Mobile Tips",
    "Repair Guides",
    "Battery Care",
    "Buying Guide",
    "Used Phone Guide",
    "Sell Your Phone",
    "Troubleshooting",
  ];

  for (const name of BLOG_CATEGORIES) {
    await BlogCategory.findOneAndUpdate(
      { slug: slugify(name) },
      { name, slug: slugify(name), description: `${name} from HMC Mobile` },
      { upsert: true }
    );
  }

  const BLOG_POSTS = [
    {
      title: "How to Check Battery Health Before Buying a Used iPhone",
      category: "Battery Care",
      excerpt:
        "Battery health affects daily performance more than most buyers expect. Here is a practical checklist before you pay.",
      content: `Battery wear is one of the biggest variables in a used iPhone.

Before you buy:
1. Ask for the Settings → Battery → Battery Health screen.
2. Check Maximum Capacity and Peak Performance Capability.
3. Watch for unexpected shutdowns or fast drain during a short demo.
4. Confirm whether the battery was replaced and request supporting notes if available.

At HMC Mobile, listed devices include condition notes so you can compare options with clearer expectations.`,
      featuredImage:
        "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1200&q=80",
      tags: ["battery", "iphone", "used phones"],
    },
    {
      title: "Why Is Your Phone Charging Slowly?",
      category: "Troubleshooting",
      excerpt:
        "Slow charging is rarely random. Cable, port, adapter, software, and battery health all play a role.",
      content: `If charging suddenly feels slower, work through the basics first:

• Try a different cable and wall adapter rated for your phone.
• Clean the charging port carefully — lint is a common culprit.
• Test wireless charging if your model supports it.
• Check for background updates or thermal throttling when the phone is hot.
• Review battery health if the phone is older.

If the port or battery is worn, a professional diagnosis is usually faster than guessing with accessories.`,
      featuredImage:
        "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
      tags: ["charging", "troubleshooting"],
    },
    {
      title: "10 Things to Check Before Buying a Second-Hand Phone",
      category: "Used Phone Guide",
      excerpt:
        "A quick inspection checklist covering screen, body, cameras, sensors, storage, and seller transparency.",
      content: `Buying used can be smart when you inspect carefully.

Checklist:
1. Display — dead pixels, burn-in, touch response
2. Body — bends, frame gaps, loose buttons
3. Cameras — focus, flash, microphone during video
4. Speakers and earpiece
5. Charging and data transfer
6. Biometrics — Face ID / fingerprint
7. Network bands and SIM detection
8. Storage and available space
9. IMEI/service history where available
10. Warranty and return terms from the seller

HMC Mobile listings include condition and specification details so comparisons are easier.`,
      featuredImage:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
      tags: ["buying guide", "used phones"],
    },
    {
      title: "Original vs Compatible Display: What's the Difference?",
      category: "Repair Guides",
      excerpt:
        "Display quality, colour accuracy, brightness, and longevity can differ by part type. Know what you are approving.",
      content: `Not every replacement display behaves the same.

Original / OEM-grade parts typically match factory colour and brightness more closely.
Compatible parts can be more affordable but may vary in touch feel, white balance, or outdoor visibility.

Before approving a repair, ask:
• What part grade is being used?
• Will Face ID / True Tone / fingerprint features be retained?
• What warranty applies to the display work?

Clear part options help you choose based on budget and expectations.`,
      featuredImage:
        "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=1200&q=80",
      tags: ["display", "repair"],
    },
    {
      title: "How to Prepare Your Old Phone Before Selling It",
      category: "Sell Your Phone",
      excerpt:
        "Back up, sign out, wipe, and photograph honestly — small steps that speed up buyback evaluation.",
      content: `Before you submit a sell request:

1. Back up photos and important files.
2. Sign out of iCloud / Google / Find My and remove the account lock.
3. Factory reset the device.
4. Charge the phone enough for inspection demos.
5. Photograph the screen, back, sides, and any defects clearly.
6. Note storage, accessories, and bill availability.

Honest photos and unlocked devices usually lead to faster, clearer offers.`,
      featuredImage:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
      tags: ["sell", "buyback"],
    },
    {
      title: "How to Protect Your Phone Battery",
      category: "Mobile Tips",
      excerpt:
        "Simple daily habits that reduce unnecessary heat and deep cycles without complicated routines.",
      content: `Battery longevity is mostly about heat and extreme charge cycles.

Practical habits:
• Avoid leaving the phone in hot cars or under direct sun while charging.
• Use a decent charger — very cheap adapters can run hot.
• Occasional full cycles are fine; constant 0% to 100% under heat is harder on cells.
• Remove thick cases if the phone becomes warm during fast charge.
• Update software when battery management fixes are included.

When capacity drops enough to disrupt your day, a health check and replacement quote is the practical next step.`,
      featuredImage:
        "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1200&q=80",
      tags: ["battery", "tips"],
    },
  ];

  const now = Date.now();
  for (let i = 0; i < BLOG_POSTS.length; i++) {
    const post = BLOG_POSTS[i];
    const slug = slugify(post.title);
    const content = post.content;
    await BlogPost.findOneAndUpdate(
      { slug },
      {
        ...post,
        slug,
        authorName: "HMC Mobile",
        seoTitle: `${post.title} | HMC Mobile`,
        seoDescription: post.excerpt,
        status: "published",
        publishedAt: new Date(now - i * 86400000 * 2),
        readingMinutes: Math.max(3, Math.ceil(content.split(/\s+/).length / 200)),
      },
      { upsert: true }
    );
  }

  console.log(`Seed complete. ${PRODUCTS.length} products upserted.`);
  console.log(`Blog: ${BLOG_POSTS.length} articles published.`);
  console.log("Admin: admin@hmkmobile.in / Admin@123");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
