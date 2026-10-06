# RoomSplits - PG, Hostel & Co-Living Platform

**RoomSplits** is a modern, production-ready PG, hostel, and room discovery, physical visit scheduling, online booking, and rental management platform built for tenants and property owners.

---

## 🌟 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) primitives, [Lucide Icons](https://lucide.dev/)
- **Backend & APIs**: Next.js Server Actions & Route Handlers
- **Database & Auth**: [Supabase](https://supabase.com/) PostgreSQL & Supabase Auth
- **Storage**: Supabase Storage
- **Payments**: Razorpay (Integration structure prepared)
- **Maps**: Google Maps API (Integration structure prepared)
- **Deployment**: Vercel

---

## 🚀 How to Install & Setup

### 1. Prerequisites
Ensure you have the following installed on your local machine:
- Node.js (v18.x or later)
- npm (v9.x or later)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-org/room-splits.git
cd "room splitz"
npm install
```

---

## ⚙️ Environment Variables

Copy `.env.example` to create your `.env.local` file:
```bash
cp .env.example .env.local
```

Configure your environment keys in `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# App Public URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Future Integrations
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

> **Note**: Never commit real production secrets or API keys to git repositories.

---

## 🏃 How to Run Locally

Start the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the landing page.

---

## 🏗️ Project Architecture & Folder Structure

The repository follows a clean, feature-driven domain architecture:

```
src/
  ├── app/                  # Next.js App Router pages, layouts, and global styles
  ├── components/           # Reusable UI & Layout components
  │   ├── layout/           # Navbar, Footer, Drawers
  │   └── ui/               # Button, Card, Badge, Input primitives
  ├── config/               # Site configuration, environment validation, constants
  ├── features/             # Isolated Domain Feature Modules
  │   ├── admin/            # Platform super-admin metric dashboards
  │   ├── authentication/   # Supabase Auth facade & OTP login helpers
  │   ├── bookings/         # Room reservation & lock-in period management
  │   ├── checkout/         # Booking checkout summary & payment trigger
  │   ├── complaints/       # Resident maintenance ticket system
  │   ├── owners/           # Property owner portal & bed occupancy tracking
  │   ├── payments/         # Razorpay transaction schema & rent invoices
  │   ├── properties/       # PG & Hostel listings, amenities & room options
  │   ├── reviews/          # Resident feedback & rating system
  │   ├── search/           # Location, gender policy & price search engine
  │   ├── stays/            # Active tenant residency & roommate directory
  │   ├── users/            # Tenant profiles & preference management
  │   └── visits/           # Physical visit scheduling & owner confirmation
  ├── hooks/                # Custom React hooks (useAuth, useDebounce, useMediaQuery)
  ├── lib/                  # Shared utilities & Supabase client factories
  │   ├── supabase/         # Browser, Server, and Middleware clients
  │   └── utils.ts          # Tailwind class merging & INR currency formatting
  ├── services/             # Core service layer & data facades
  └── types/                # TypeScript interface definitions for domain entities
```

---

## 🛠️ Development Workflow

1. **Type Checking & Linting**:
   ```bash
   npm run lint
   ```
2. **Building for Production**:
   ```bash
   npm run build
   ```
3. **Running Production Server**:
   ```bash
   npm run start
   ```

---

## 📄 License
This project is proprietary software under RoomSplits Inc. All rights reserved.
