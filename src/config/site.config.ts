export const siteConfig = {
  name: "RoomSplits",
  description: "Seamless PG, hostel, and room discovery, visit scheduling, booking, and rental management platform.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "https://roomsplits.com/og.jpg",
  links: {
    github: "https://github.com/roomsplits/roomsplits",
    twitter: "https://twitter.com/roomsplits",
  },
  contact: {
    email: "support@roomsplits.com",
    phone: "+91 1800-ROOM-SPLIT",
  },
  settings: {
    visitPassFeeAmount: 9,
    bookingPlatformFeeAmount: 499,
    lockInMonthsDefault: 3,
    platformCommissionPercent: 5,
  },
  navLinks: [
    { name: "Explore PGs & Rooms", href: "#properties" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "For Owners", href: "#owners" },
    { name: "Pricing & Plans", href: "#pricing" },
  ],
  propertyTypes: [
    { id: "pg", label: "Paying Guest (PG)" },
    { id: "hostel", label: "Hostel" },
    { id: "coliving", label: "Co-Living Space" },
    { id: "flat", label: "Shared Flat / Room" },
  ],
  amenities: [
    "High-Speed Wi-Fi",
    "Air Conditioning",
    "3x Daily Meals",
    "Housekeeping",
    "24/7 Security & CCTV",
    "Power Backup",
    "Laundry Service",
    "Gym & Fitness Zone",
    "Attached Bathroom",
    "Study Table & Desk",
  ],
};
