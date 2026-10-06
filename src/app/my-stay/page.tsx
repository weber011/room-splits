"use client";

import { useEffect, useState } from "react";
import {
  getTenantActiveStay,
  submitStayReview,
  recordRentPaymentSuccess,
} from "@/services/stay.service";
import { checkoutService } from "@/services/checkout.service";
import { StayRecord } from "@/types/stay.types";
import { CheckoutRecord } from "@/types/checkout.types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Home,
  CreditCard,
  FileText,
  Wrench,
  Star,
  LogOut,
  Phone,
  User,
  Lock,
  CheckCircle2,
  Clock,
  Building,
  Plus,
  AlertTriangle,
  FileCheck,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type TabType = "overview" | "rent" | "documents" | "complaints" | "reviews" | "checkout";

export default function MyStayPage() {
  const [stay, setStay] = useState<StayRecord | null>(null);
  const [checkoutRecord, setCheckoutRecord] = useState<CheckoutRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Checkout modal form state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [expectedDate, setExpectedDate] = useState("");
  const [checkoutReason, setCheckoutReason] = useState("");
  const [submittingCheckout, setSubmittingCheckout] = useState(false);

  // Dispute modal state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [acknowledgingSettlement, setAcknowledgingSettlement] = useState(false);

  // Review form state
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [maintenanceRating, setMaintenanceRating] = useState(5);
  const [ownerRating, setOwnerRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Rent Payment state
  const [payingRentId, setPayingRentId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await getTenantActiveStay("u-101");
      setStay(data);

      const chk = await checkoutService.getTenantCheckout("u-101");
      setCheckoutRecord(chk);
    } catch (err) {
      console.error("Failed to load active stay data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading Active Residency Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stay) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <Card className="border-slate-800 bg-slate-900/90 p-8 max-w-md text-center space-y-4">
          <Home className="h-12 w-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">No Active Residency</h2>
          <p className="text-xs text-slate-400">You do not have an active room booking or move-in record yet.</p>
          <Link href="/discover">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold">
              Explore Available Rooms
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const getStayStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">ACTIVE RESIDENCY</Badge>;
      case "UPCOMING":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">UPCOMING MOVE-IN</Badge>;
      case "CHECKOUT_REQUESTED":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">CHECKOUT REQUESTED</Badge>;
      case "CHECKED_OUT":
        return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">CHECKED OUT</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRentStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">RENT PAID</Badge>;
      case "DUE":
        return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse">RENT DUE</Badge>;
      case "OVERDUE":
        return <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40">OVERDUE</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlePayRent = async (rentItem: { id: string; amount: number; month: string }) => {
    setPayingRentId(rentItem.id);

    setTimeout(async () => {
      const updated = await recordRentPaymentSuccess(stay.id, rentItem.id, {
        razorpayPaymentId: `pay_RENT_${Date.now()}`,
        razorpayOrderId: `order_RENT_${Date.now()}`,
        paidAt: new Date().toISOString(),
      });
      setStay({ ...updated });
      setPayingRentId(null);
    }, 1200);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expectedDate) return;
    setSubmittingCheckout(true);

    try {
      await checkoutService.createCheckoutRequest({
        stayId: stay.id,
        requestedCheckoutDate: expectedDate,
        reason: checkoutReason,
      });
      setShowCheckoutModal(false);
      await loadData();
    } catch (err) {
      console.error("Checkout request error", err);
    } finally {
      setSubmittingCheckout(false);
    }
  };

  const handleAcknowledgeSettlement = async () => {
    if (!checkoutRecord) return;
    setAcknowledgingSettlement(true);

    try {
      await checkoutService.acknowledgeUserSettlement(checkoutRecord.id);
      await loadData();
    } catch (err) {
      console.error("Settlement acknowledgement error", err);
    } finally {
      setAcknowledgingSettlement(false);
    }
  };

  const handleRaiseDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutRecord || !disputeReason.trim()) return;
    setSubmittingDispute(true);

    try {
      await checkoutService.raiseUserDispute(checkoutRecord.id, disputeReason);
      setShowDisputeModal(false);
      setDisputeReason("");
      await loadData();
    } catch (err) {
      console.error("Dispute submission error", err);
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);

    try {
      const rev = await submitStayReview(stay.id, {
        rating: reviewRating,
        cleanlinessRating,
        maintenanceRating,
        ownerRating,
        comment: reviewComment,
      });
      setStay({ ...stay, review: rev });
      setReviewSuccess(true);
    } catch (err) {
      console.error("Review submission error", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const pendingRentCount = stay.rentHistory.filter((r) => r.status !== "PAID").length;
  const activeComplaintCount = stay.complaints.filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Top Main Stay Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-24 rounded-2xl overflow-hidden border border-slate-800 shrink-0 bg-slate-950">
              <Image src={stay.coverImage} alt={stay.propertyName} fill className="object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {getStayStatusBadge(stay.status)}
                {getRentStatusBadge(stay.paymentStatus)}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stay.propertyName}</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                <Building className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{stay.roomNumber} ({stay.sharingType}) &bull; {stay.propertyAddress}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setActiveTab("checkout");
                setShowCheckoutModal(true);
              }}
              variant="outline"
              size="sm"
              className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10 gap-1.5 text-xs font-semibold"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Request Move-Out</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Key Metrics Header Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px] mb-1">Monthly Rent</span>
            <span className="text-lg font-bold text-emerald-400">₹{stay.monthlyRent.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-slate-400 block">Due 5th of every month</span>
          </div>
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px] mb-1">Security Deposit</span>
            <span className="text-lg font-bold text-white">₹{stay.securityDeposit.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-emerald-400/90 block">100% Refundable</span>
          </div>
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px] mb-1">Move-In Date</span>
            <span className="text-base font-bold text-slate-200">{stay.moveInDate}</span>
            <span className="text-[10px] text-slate-400 block">Lock-in until {stay.lockInEndDate}</span>
          </div>
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px] mb-1">Next Rent Due</span>
            <span className="text-base font-bold text-amber-400">{stay.nextRentDueDate}</span>
            <span className="text-[10px] text-slate-400 block">30 days notice required</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar with Notification Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 no-scrollbar">
        {[
          { id: "overview", label: "Stay Overview", icon: Home },
          { id: "rent", label: "Rent & Payments", icon: CreditCard, badge: pendingRentCount > 0 ? `${pendingRentCount} DUE` : null, badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
          { id: "documents", label: "Private Documents", icon: FileText, badge: `${stay.documents.length}`, badgeColor: "bg-slate-800 text-slate-300" },
          { id: "complaints", label: "Complaints & Support", icon: Wrench, badge: activeComplaintCount > 0 ? `${activeComplaintCount} OPEN` : null, badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/40" },
          { id: "reviews", label: "Resident Reviews", icon: Star },
          { id: "checkout", label: "Move-Out & Settlement", icon: LogOut, badge: checkoutRecord ? checkoutRecord.status : null, badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                  : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-bold ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Stay Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-5">
              <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
                <Building className="h-5 w-5 text-emerald-400" />
                Residency & Room Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px]">Room & Bed Assignment</span>
                  <p className="font-bold text-white text-sm">{stay.roomNumber}</p>
                  <span className="text-[11px] text-slate-400">{stay.sharingType}</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px]">Lock-In Period Terms</span>
                  <p className="font-bold text-emerald-400 text-sm">Lock-in until {stay.lockInEndDate}</p>
                  <span className="text-[11px] text-slate-400">Notice period: {stay.noticePeriodDays} days</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Property Landlord / Owner</span>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px]">
                    Verified Owner
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                      {stay.owner.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{stay.owner.name}</h4>
                      <p className="text-xs text-slate-400">{stay.owner.email}</p>
                    </div>
                  </div>
                  <a href={`tel:${stay.owner.phone}`}>
                    <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
                      <Phone className="h-3.5 w-3.5" />
                      <span>Call</span>
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-400" />
                  Roommates in {stay.roomNumber}
                </h3>
                <Badge variant="secondary" className="text-[10px]">
                  {stay.roommates.length} Resident
                </Badge>
              </div>

              {stay.roommates.length > 0 ? (
                <div className="space-y-3">
                  {stay.roommates.map((rm) => (
                    <div key={rm.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full overflow-hidden relative border border-slate-800 bg-slate-900 shrink-0">
                          <Image src={rm.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} alt={rm.name} fill className="object-cover" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-xs">{rm.name}</h4>
                          <p className="text-[11px] text-slate-400">{rm.occupation || "Co-living Tenant"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No other co-tenants assigned to this room yet.</p>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Rent */}
      {activeTab === "rent" && (
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-1">
                  Current Monthly Rent Billing
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-white">₹{stay.monthlyRent.toLocaleString("en-IN")}</span>
                  <span className="text-xs text-slate-400">Due Date: {stay.nextRentDueDate}</span>
                </div>
              </div>

              <div>
                {stay.paymentStatus !== "PAID" ? (
                  <Button
                    onClick={() => handlePayRent(stay.rentHistory.find((r) => r.status !== "PAID") || { id: "rent-102", amount: stay.monthlyRent, month: "November 2026" })}
                    disabled={!!payingRentId}
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold gap-2 text-xs sm:text-sm"
                  >
                    {payingRentId ? (
                      <span>Verifying Razorpay Order...</span>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        <span>Pay ₹{stay.monthlyRent.toLocaleString("en-IN")} Rent Now</span>
                      </>
                    )}
                  </Button>
                ) : (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-sm px-4 py-2">
                    Rent Status: PAID & UP TO DATE
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Documents */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Lock className="h-5 w-5 text-emerald-400" />
              Private Tenancy Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stay.documents.map((doc) => (
                <div key={doc.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-400" />
                    <div>
                      <h4 className="font-semibold text-white text-xs">{doc.title}</h4>
                      <span className="text-[10px] text-slate-400">{doc.category}</span>
                    </div>
                  </div>
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" className="h-8 text-xs text-slate-200 border-slate-700">
                      View
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Complaints */}
      {activeTab === "complaints" && (
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Wrench className="h-5 w-5 text-emerald-400" />
                Support Tickets
              </h3>
              <Link href="/complaints">
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold gap-1 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  View Helpdesk
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 5: Reviews */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
              Resident Experience & Landlord Review
            </h3>

            {stay.review || reviewSuccess ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Star className="h-4 w-4 fill-amber-400" />
                    <span>Overall Rating: {stay.review?.rating || reviewRating} / 5</span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">PUBLISHED</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                  <div>Cleanliness: <strong className="text-white">{stay.review?.cleanlinessRating || cleanlinessRating}/5</strong></div>
                  <div>Maintenance: <strong className="text-white">{stay.review?.maintenanceRating || maintenanceRating}/5</strong></div>
                  <div>Landlord: <strong className="text-white">{stay.review?.ownerRating || ownerRating}/5</strong></div>
                </div>
                <p className="text-slate-200 italic pt-1">&ldquo;{stay.review?.comment || reviewComment}&rdquo;</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Overall Rating</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>{r} Stars</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Cleanliness</label>
                    <select
                      value={cleanlinessRating}
                      onChange={(e) => setCleanlinessRating(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>{r} Stars</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Maintenance</label>
                    <select
                      value={maintenanceRating}
                      onChange={(e) => setMaintenanceRating(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>{r} Stars</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Landlord Responsiveness</label>
                    <select
                      value={ownerRating}
                      onChange={(e) => setOwnerRating(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>{r} Stars</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Detailed Review & Experience</label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your stay experience, room quality, owner responsiveness, etc."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <Button type="submit" disabled={submittingReview} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold">
                  {submittingReview ? "Submitting Review..." : "Publish Review"}
                </Button>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* Tab 6: Move-Out & Security Deposit Settlement Breakdown */}
      {activeTab === "checkout" && (
        <div className="space-y-6">
          {/* Checkout Status Stepper */}
          <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <LogOut className="h-5 w-5 text-rose-400" />
                  Move-Out & Security Deposit Settlement Tracker
                </h3>
                <p className="text-xs text-slate-400 mt-1">Track request progress, room inspection, deposit deductions, and final refund.</p>
              </div>

              {checkoutRecord ? (
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-xs px-3 py-1">
                  STATUS: {checkoutRecord.status}
                </Badge>
              ) : (
                <Button
                  onClick={() => setShowCheckoutModal(true)}
                  size="sm"
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold gap-1 text-xs"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Initiate Checkout
                </Button>
              )}
            </div>

            {/* Stepper Steps */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[11px] pt-2">
              {[
                "REQUESTED",
                "OWNER_REVIEW",
                "INSPECTION",
                "SETTLEMENT_PENDING",
                "SETTLED",
                "CLOSED",
              ].map((st, i) => {
                const currentStatus = checkoutRecord?.status || "REQUESTED";
                const isPassed = checkoutRecord ? true : i === 0;
                return (
                  <div
                    key={st}
                    className={`p-2.5 rounded-xl border font-bold ${
                      currentStatus === st
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md"
                        : isPassed
                        ? "bg-slate-950 border-slate-800 text-slate-300"
                        : "bg-slate-950/40 border-slate-800/40 text-slate-500"
                    }`}
                  >
                    <span className="block text-[10px] text-slate-400 mb-0.5">Step {i + 1}</span>
                    <span>{st.replace("_", " ")}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Detailed Security Deposit Settlement Breakdown Card */}
          {checkoutRecord?.settlement ? (
            <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 mb-1">
                    Official Settlement Statement
                  </Badge>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-emerald-400" />
                    Security Deposit Settlement Breakdown
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Original Deposit: ₹{checkoutRecord.settlement.originalSecurityDeposit.toLocaleString("en-IN")} &bull; Issued on {new Date(checkoutRecord.settlement.settlementDate).toLocaleDateString("en-IN")}
                  </p>
                </div>

                {checkoutRecord.settlement.paymentRefundReference && (
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Razorpay Refund Ref</span>
                    <strong className="font-mono text-emerald-400 text-xs">{checkoutRecord.settlement.paymentRefundReference}</strong>
                  </div>
                )}
              </div>

              {/* Deductions Breakdown Table */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                  Itemized Deductions ({checkoutRecord.settlement.deductions.length} Items)
                </h4>

                {checkoutRecord.settlement.deductions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Deduction Category</th>
                          <th className="py-2.5 px-3">Description</th>
                          <th className="py-2.5 px-3 text-right">Deducted Amount</th>
                          <th className="py-2.5 px-3 text-right">Evidence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {checkoutRecord.settlement.deductions.map((d) => (
                          <tr key={d.id} className="hover:bg-slate-950/50">
                            <td className="py-3 px-3 font-semibold text-rose-400 uppercase text-[11px]">{d.category}</td>
                            <td className="py-3 px-3 text-slate-200">{d.description}</td>
                            <td className="py-3 px-3 text-right font-bold text-rose-400">-₹{d.amount.toLocaleString("en-IN")}</td>
                            <td className="py-3 px-3 text-right">
                              {d.evidenceUrl ? (
                                <a href={d.evidenceUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center justify-end gap-1 font-semibold">
                                  <span>Proof</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    No deductions applied by property owner. Full security deposit refundable.
                  </p>
                )}
              </div>

              {/* Settlement Math Formula Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Original Security Deposit Paid</span>
                  <span className="font-semibold text-white">₹{checkoutRecord.settlement.originalSecurityDeposit.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-rose-400">
                  <span>Total Valid Deductions</span>
                  <span className="font-semibold">-₹{checkoutRecord.settlement.deductions.reduce((a, b) => a + b.amount, 0).toLocaleString("en-IN")}</span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-base font-extrabold">
                  <span className="text-white">Net Refundable Security Deposit</span>
                  <span className="text-emerald-400 text-xl">₹{checkoutRecord.settlement.refundableAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Owner Notes */}
              {checkoutRecord.settlement.ownerNotes && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <span className="text-slate-400 text-[11px] block font-semibold">Landlord Inspection Notes</span>
                  <p className="text-slate-200">{checkoutRecord.settlement.ownerNotes}</p>
                </div>
              )}

              {/* Dispute Warning if Dispute exists */}
              {checkoutRecord.settlement.dispute && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                  <strong className="block font-bold text-amber-200 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
                    Contest Dispute Open with Admin Platform
                  </strong>
                  <p>Reason: {checkoutRecord.settlement.dispute.userReason}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    Status: {checkoutRecord.settlement.dispute.status} &bull; Admin will review landlord evidence.
                  </span>
                </div>
              )}

              {/* Settlement Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
                {!checkoutRecord.settlement.userAcknowledgement ? (
                  <>
                    <Button
                      onClick={() => setShowDisputeModal(true)}
                      variant="outline"
                      size="sm"
                      className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs gap-1.5 w-full sm:w-auto"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <span>Contest / Dispute Deductions</span>
                    </Button>

                    <Button
                      onClick={handleAcknowledgeSettlement}
                      disabled={acknowledgingSettlement}
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-2 w-full sm:w-auto"
                    >
                      {acknowledgingSettlement ? (
                        <span>Processing Refund Acknowledgment...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Accept & Acknowledge ₹{checkoutRecord.settlement.refundableAmount.toLocaleString("en-IN")} Refund</span>
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center font-bold">
                    ✓ Settlement Acknowledged & Refund Processed. Residency Closed.
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="border-slate-800 bg-slate-900/90 p-8 text-center space-y-3">
              <Clock className="h-10 w-10 text-slate-600 mx-auto" />
              <h4 className="font-bold text-white text-base">Checkout Request Submitted</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Your landlord will conduct a move-out room inspection and submit the itemized deposit settlement statement here.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Checkout Request Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="border-slate-800 bg-slate-900 p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <LogOut className="h-5 w-5 text-rose-400" />
                Initiate Move-Out Notice Request
              </h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Expected Move-Out Date</label>
                <Input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Reason for Move-Out</label>
                <textarea
                  rows={2}
                  value={checkoutReason}
                  onChange={(e) => setCheckoutReason(e.target.value)}
                  placeholder="e.g. Relocating, course completion..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCheckoutModal(false)} className="border-slate-800 text-slate-300">
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingCheckout} size="sm" className="bg-rose-500 hover:bg-rose-600 text-white font-bold">
                  {submittingCheckout ? "Submitting..." : "Confirm Move-Out Notice"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Raise Contest / Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="border-slate-800 bg-slate-900 p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                Contest Security Deposit Deductions
              </h3>
              <button onClick={() => setShowDisputeModal(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleRaiseDisputeSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Reason for Contesting Deductions</label>
                <textarea
                  rows={4}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Explain why you disagree with specific deduction line-items (e.g. Deep cleaning was done prior to key handover)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowDisputeModal(false)} className="border-slate-800 text-slate-300">
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingDispute} size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
                  {submittingDispute ? "Submitting Dispute..." : "Submit Admin Dispute"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
