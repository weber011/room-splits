"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { Tabs } from "@/components/ui/tabs";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  VerifiedBadge,
  PriceDisplay,
  RatingDisplay,
  StatusBadge,
  PropertyCard,
  PropertyImageGallery,
  LocationSelector,
  SearchBar,
  FilterPanel,
  RoomCard,
  BookingCard,
  PaymentCard,
  ComplaintCard,
  ReviewCard,
  DashboardStatCard,
  DataTable,
  DashboardSidebar,
} from "@/components/common";
import { RazorpayTransaction } from "@/types/payment.types";
import { ComplaintTicket } from "@/types/complaint.types";
import { Building2, Users, CreditCard, Sparkles, Layers, SlidersHorizontal } from "lucide-react";

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState("primitives");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Bengaluru");

  const sampleProperty = {
    id: "prop-101",
    ownerId: "owner-1",
    title: "UrbanNest Executive Co-Living & PG",
    slug: "urbannest-executive-coliving",
    description: "Premium co-living space with high-speed 5G WiFi, 3x daily chef meals, and gaming lounge.",
    category: "coliving" as const,
    genderPolicy: "unisex" as const,
    location: {
      address: "100 Feet Road",
      locality: "Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
    },
    amenities: ["High-Speed Wi-Fi", "3x Daily Meals", "AC Rooms", "Gym Access"],
    rules: ["No smoking", "Visitors till 10 PM"],
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    ],
    coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    featured: true,
    startingPrice: 12500,
    rating: 4.9,
    reviewCount: 142,
    roomOptions: [],
    noticePeriodDays: 30,
    lockInMonths: 3,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  };

  const sampleRoom = {
    id: "room-1",
    sharingType: "double" as const,
    monthlyRent: 11000,
    securityDeposit: 22000,
    availableBeds: 2,
    totalBeds: 4,
    hasAttachedBathroom: true,
    hasBalcony: true,
  };

  const sampleBooking = {
    id: "bk-994812",
    bookingCode: "BK-2026-9901",
    user: {
      id: "u-101",
      fullName: "Aditya Kumar",
      email: "aditya@example.com",
      phone: "+91 98765 43210",
    },
    owner: {
      id: "owner-1",
      name: "Vikram Malhotra",
      phone: "+91 98112 23344",
      email: "vikram@urbannest.com",
    },
    property: {
      id: "prop-101",
      title: "UrbanNest Executive Co-Living & PG",
      locality: "Indiranagar",
      city: "Bengaluru",
      coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    },
    room: {
      id: "r-single",
      roomNumber: "A-101",
      sharingType: "Single Sharing AC",
      totalBeds: 2,
      availableBeds: 1,
    },
    bookingDate: "2026-10-01",
    moveInDate: "15 Oct 2026",
    monthlyRent: 11000,
    securityDeposit: 22000,
    platformCharges: 499,
    totalAmount: 33499,
    paymentStatus: "PAID" as const,
    bookingStatus: "CONFIRMED" as const,
    agreementUrl: "https://example.com/agreement.pdf",
    createdAt: "2026-10-01",
    updatedAt: "2026-10-01",
  };

  const samplePayment: RazorpayTransaction = {
    id: "tx-9002",
    razorpayOrderId: "order_BK8001",
    razorpayPaymentId: "pay_BK8001_PAID",
    signature: "sig_mock_verified_002",
    amount: 33499,
    currency: "INR",
    paymentType: "BOOKING_RENT",
    user: {
      id: "u-101",
      fullName: "Aditya Kumar",
      email: "aditya@example.com",
      phone: "+91 98765 43210",
    },
    reference: {
      bookingId: "bk-994812",
      propertyId: "prop-101",
      propertyName: "UrbanNest Executive Co-Living & PG",
    },
    status: "SUCCESS",
    receiptUrl: "https://roomsplits.com/receipts/tx-9002.pdf",
    paidAt: "2026-10-01T10:00:00Z",
    createdAt: "2026-10-01T10:00:00Z",
  };

  const sampleComplaint: ComplaintTicket = {
    id: "cmp-1001",
    ticketNumber: "TKT-2026-9001",
    user: {
      id: "u-101",
      fullName: "Aditya Kumar",
      email: "aditya@example.com",
      phone: "+91 98765 43210",
    },
    owner: {
      id: "owner-1",
      name: "Vikram Malhotra",
      email: "vikram@urbannest.com",
      phone: "+91 98112 23344",
    },
    property: {
      id: "prop-1",
      title: "UrbanNest Executive Co-Living & PG",
      locality: "Indiranagar",
      city: "Bengaluru",
    },
    room: {
      id: "r-204",
      roomNumber: "Room 204-B",
      sharingType: "Double Sharing AC",
    },
    stay: {
      id: "stay-8001",
      moveInDate: "2026-10-03",
    },
    category: "ELECTRICITY",
    title: "WiFi High Latency in Room 204",
    description: "The 5GHz WiFi frequency is disconnecting frequently during working hours.",
    attachments: [],
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    responses: [],
    created_at: "2026-10-04T10:00:00Z",
    updated_at: "2026-10-04T14:30:00Z",
  };

  const sampleReview = {
    id: "rev-12",
    propertyId: "prop-101",
    tenantId: "user-1",
    tenantName: "Ananya Roy",
    rating: 4.9,
    cleanlinessRating: 5,
    foodRating: 4.8,
    amenitiesRating: 5,
    valueForMoneyRating: 4.9,
    comment: "Gourmet daily food quality and super fast WiFi for remote software work!",
    isVerifiedResident: true,
    createdAt: "3 days ago",
  };

  const tableData = [
    { id: "1", tenant: "Aarav Sharma", room: "201-A", rent: "₹12,000", status: "Paid" },
    { id: "2", tenant: "Priya Patel", room: "202-B", rent: "₹10,500", status: "Pending" },
    { id: "3", tenant: "Rahul Verma", room: "304-Single", rent: "₹15,000", status: "Paid" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-3 border-b border-slate-800 pb-6">
        <Badge variant="default" className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> RoomSplits Core Design System
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          UI Component Library & Tokens
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
          Clean, mobile-first, India-focused component system built with Tailwind CSS, shadcn/ui principles, and accessible semantic HTML.
        </p>

        {/* Navigation Tabs */}
        <div className="pt-4">
          <Tabs
            tabs={[
              { id: "primitives", label: "UI Primitives & Feedback", icon: Layers },
              { id: "cards", label: "Domain Cards & Components", icon: Building2 },
              { id: "dashboard", label: "Data Tables & Dashboard", icon: SlidersHorizontal },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      {/* Tab 1: UI Primitives & Feedback */}
      {activeTab === "primitives" && (
        <div className="space-y-10 animate-in fade-in duration-300">
          {/* Buttons & Badges */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">Buttons & Badges</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="default">Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="danger">Danger Action</Button>
              <Button size="sm">Small Button</Button>
              <Button size="lg">Large Button</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge variant="default">Emerald Badge</Badge>
              <Badge variant="secondary">Secondary Badge</Badge>
              <Badge variant="accent">Accent Badge</Badge>
              <Badge variant="warning">Warning Badge</Badge>
              <VerifiedBadge type="property" />
              <VerifiedBadge type="owner" />
              <StatusBadge status="active" />
              <StatusBadge status="pending" />
            </div>
          </section>

          {/* Form Inputs & Selects */}
          <section className="space-y-4 max-w-xl">
            <h3 className="text-xl font-bold text-white">Form Inputs & Location Selector</h3>
            <Input placeholder="Enter your full name..." />
            <LocationSelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
            <Select
              label="Select Gender Preference"
              options={[
                { value: "boys", label: "Boys Only PG" },
                { value: "girls", label: "Girls Only PG" },
                { value: "unisex", label: "Unisex Co-Living" },
              ]}
            />
          </section>

          {/* Alerts & States */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">Alert Messages & States</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Alert variant="info" title="Scheduled Visit Confirmed">
                The property manager approved your visit for tomorrow at 4:00 PM.
              </Alert>
              <Alert variant="success" title="Payment Successful">
                Security deposit of ₹22,000 processed securely via Razorpay.
              </Alert>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <Skeleton className="h-44 w-full" />
              <EmptyState title="No PGs Found" description="Try broadening your location search or adjusting filters." />
              <ErrorState title="Network Error" message="Failed to load live property beds. Please retry." onRetry={() => {}} />
            </div>
          </section>

          {/* Dialog / Modal Trigger */}
          <section className="space-y-4 pt-4">
            <h3 className="text-xl font-bold text-white">Modal / Dialog Component</h3>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
              Open Sample Modal Dialog
            </Button>
            <Dialog
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              title="Schedule Physical Visit"
              description="Pick a date and time to inspect the property in person."
            >
              <div className="space-y-4 pt-2">
                <Input type="date" className="bg-slate-800" />
                <Select
                  options={[
                    { value: "morning", label: "10:00 AM - 12:00 PM" },
                    { value: "afternoon", label: "02:00 PM - 04:00 PM" },
                    { value: "evening", label: "05:00 PM - 07:00 PM" },
                  ]}
                />
                <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                  Confirm Visit Request
                </Button>
              </div>
            </Dialog>
          </section>
        </div>
      )}

      {/* Tab 2: Domain Cards & Components */}
      {activeTab === "cards" && (
        <div className="space-y-10 animate-in fade-in duration-300">
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">Search Bar & Filter Panel</h3>
            <SearchBar onOpenFilter={() => {}} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
              <FilterPanel className="lg:col-span-1" />
              <div className="lg:col-span-2 space-y-6">
                <h4 className="text-lg font-semibold text-white">Property Cards Showcase</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PropertyCard property={sampleProperty} />
                  <div className="space-y-4">
                    <RoomCard room={sampleRoom} />
                    <PriceDisplay amount={12500} originalAmount={14000} size="lg" />
                    <RatingDisplay rating={4.9} reviewCount={142} size="md" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">Image Gallery, Booking & Payment Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PropertyImageGallery images={sampleProperty.images} title={sampleProperty.title} />
              <BookingCard booking={sampleBooking} propertyName={sampleProperty.title} onViewAgreement={() => {}} />
              <PaymentCard payment={samplePayment} onDownloadInvoice={() => {}} />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">Complaint & Review Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ComplaintCard ticket={sampleComplaint} />
              <ReviewCard review={sampleReview} />
            </div>
          </section>
        </div>
      )}

      {/* Tab 3: Data Tables & Dashboard */}
      {activeTab === "dashboard" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <DashboardStatCard title="Total Occupied Beds" value="384 / 420" change="+12%" icon={Building2} />
            <DashboardStatCard title="Monthly Rent Collected" value="₹42,50,000" change="+8.4%" icon={CreditCard} />
            <DashboardStatCard title="Active Tenants" value="384" change="+15" icon={Users} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <DashboardSidebar role="owner" className="lg:col-span-1 rounded-2xl border" />
            <div className="lg:col-span-3 space-y-4">
              <h3 className="text-xl font-bold text-white">Rent Collection Data Table</h3>
              <DataTable
                columns={[
                  { header: "Tenant Name", accessor: "tenant" },
                  { header: "Room No", accessor: "room" },
                  { header: "Monthly Rent", accessor: "rent" },
                  {
                    header: "Status",
                    accessor: (row) => (
                      <Badge variant={row.status === "Paid" ? "default" : "warning"}>
                        {row.status}
                      </Badge>
                    ),
                  },
                ]}
                data={tableData}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
