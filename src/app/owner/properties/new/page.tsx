"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ownerService, PropertyStatus } from "@/services/owner.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PropertyCategory, GenderPolicy } from "@/types";
import { Trash2, ArrowLeft, Shield, Upload, Image as ImageIcon } from "lucide-react";

export default function NewPropertyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<PropertyCategory>("coliving");
  const [genderPolicy, setGenderPolicy] = useState<GenderPolicy>("unisex");
  const [address, setAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [pincode, setPincode] = useState("");
  const [startingPrice, setStartingPrice] = useState(10000);
  const [lockInMonths, setLockInMonths] = useState(3);
  const [noticePeriodDays, setNoticePeriodDays] = useState(30);

  // Amenities & Rules State
  const [amenityInput, setAmenityInput] = useState("");
  const [amenities, setAmenities] = useState<string[]>([
    "High-Speed Wi-Fi",
    "3x Daily Meals",
    "Air Conditioning",
    "24/7 Security & CCTV",
    "Power Backup",
    "Daily Housekeeping",
  ]);

  const [ruleInput, setRuleInput] = useState("");
  const [rules, setRules] = useState<string[]>([
    "Gate closes at 11:30 PM",
    "Visitors allowed in main lounge till 10 PM",
    "No smoking inside rooms",
  ]);

  // Images State
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
  ]);

  // Rooms State
  const [rooms] = useState([
    {
      id: "r-init-1",
      sharingType: "single" as const,
      monthlyRent: 15000,
      securityDeposit: 30000,
      availableBeds: 2,
      totalBeds: 2,
      hasAttachedBathroom: true,
      hasBalcony: true,
    },
    {
      id: "r-init-2",
      sharingType: "double" as const,
      monthlyRent: 10000,
      securityDeposit: 20000,
      availableBeds: 4,
      totalBeds: 6,
      hasAttachedBathroom: true,
      hasBalcony: false,
    },
  ]);

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput("");
    }
  };

  const handleRemoveAmenity = (name: string) => {
    setAmenities(amenities.filter((a) => a !== name));
  };

  const handleAddRule = () => {
    if (ruleInput.trim() && !rules.includes(ruleInput.trim())) {
      setRules([...rules, ruleInput.trim()]);
      setRuleInput("");
    }
  };

  const handleRemoveRule = (rule: string) => {
    setRules(rules.filter((r) => r !== rule));
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl("");
    }
  };

  const handleSubmit = async (targetStatus: PropertyStatus) => {
    if (!title || !description || !address || !locality || !city || !pincode) {
      alert("Please fill in all required property details (Title, Address, City, Pincode).");
      return;
    }

    setIsSubmitting(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);
      await ownerService.createProperty({
        title,
        slug,
        description,
        category,
        genderPolicy,
        status: targetStatus === "PENDING_VERIFICATION" ? "PENDING_VERIFICATION" : "DRAFT",
        isPublished: targetStatus === "PENDING_VERIFICATION",
        location: {
          address,
          locality,
          city,
          state,
          pincode,
        },
        amenities,
        rules,
        images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"],
        coverImage: images[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
        featured: false,
        startingPrice: Number(startingPrice),
        roomOptions: rooms,
        noticePeriodDays: Number(noticePeriodDays),
        lockInMonths: Number(lockInMonths),
      });

      router.push("/owner/properties");
    } catch {
      alert("Failed to create property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="owner" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => router.back()} className="gap-1 text-slate-400">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Badge variant="accent">New Property</Badge>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">List a New PG or Hostel</h1>
          </div>
        </div>

        {/* Security / Verification Notice */}
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs flex items-start gap-3">
          <Shield className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block text-white text-sm">Security & Verification Protocol</strong>
            <span>All new listings are saved as <strong>DRAFT</strong> or <strong>PENDING VERIFICATION</strong>. Only RoomSplits Administrators can issue official <strong>VERIFIED</strong> badges after audit.</span>
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-8">
          {/* Basic Info Card */}
          <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">1. Basic Property Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Property Title *</label>
                <Input
                  placeholder="e.g. Stanza Living HSR Co-Living PG"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Category *</label>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                  options={[
                    { value: "coliving", label: "Co-Living Hub" },
                    { value: "pg", label: "Paying Guest (PG)" },
                    { value: "hostel", label: "Student Hostel" },
                    { value: "flat", label: "Shared Flat Room" },
                  ]}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Gender Policy *</label>
                <Select
                  value={genderPolicy}
                  onChange={(e) => setGenderPolicy(e.target.value as GenderPolicy)}
                  options={[
                    { value: "unisex", label: "Unisex / Unisex Floors" },
                    { value: "boys", label: "Boys Only" },
                    { value: "girls", label: "Girls Only" },
                  ]}
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Description & Highlights *</label>
                <textarea
                  rows={4}
                  placeholder="Describe food, high-speed Wi-Fi, proximity to IT parks or colleges..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                />
              </div>
            </div>
          </Card>

          {/* Location & Address Card */}
          <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">2. Location & Full Address</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Street / Building Address *</label>
                <Input
                  placeholder="e.g. Building 42, 100 Feet Road, Opposite BDA Complex"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Locality / Area *</label>
                <Input
                  placeholder="e.g. HSR Layout Sector 3"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">City *</label>
                <Input
                  placeholder="e.g. Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">State *</label>
                <Input
                  placeholder="e.g. Karnataka"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Pincode *</label>
                <Input
                  placeholder="e.g. 560102"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Rent & Policies Card */}
          <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">3. Financials & House Terms</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Starting Rent (₹/mo) *</label>
                <Input
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Lock-In Period (Months) *</label>
                <Input
                  type="number"
                  value={lockInMonths}
                  onChange={(e) => setLockInMonths(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Notice Period (Days) *</label>
                <Input
                  type="number"
                  value={noticePeriodDays}
                  onChange={(e) => setNoticePeriodDays(Number(e.target.value))}
                />
              </div>
            </div>
          </Card>

          {/* Amenities & Rules */}
          <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">4. Amenities & House Rules</h3>

            {/* Amenities */}
            <div className="space-y-3">
              <label className="text-xs text-slate-300 font-semibold">Property Amenities</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add amenity (e.g. Gym, Gaming Room)..."
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                />
                <Button type="button" size="sm" onClick={handleAddAmenity}>Add</Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {amenities.map((item) => (
                  <Badge key={item} variant="secondary" className="gap-1 text-xs py-1 px-2.5">
                    <span>{item}</span>
                    <button onClick={() => handleRemoveAmenity(item)}>
                      <Trash2 className="h-3 w-3 text-rose-400 hover:text-rose-300" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <label className="text-xs text-slate-300 font-semibold">House Rules</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add rule (e.g. Gate closes at 11:30 PM)..."
                  value={ruleInput}
                  onChange={(e) => setRuleInput(e.target.value)}
                />
                <Button type="button" size="sm" onClick={handleAddRule}>Add</Button>
              </div>

              <div className="space-y-2 pt-2">
                {rules.map((rule) => (
                  <div key={rule} className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                    <span>• {rule}</span>
                    <button onClick={() => handleRemoveRule(rule)}>
                      <Trash2 className="h-3.5 w-3.5 text-rose-400 hover:text-rose-300" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Photos & Media */}
          <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-emerald-400" />
              <span>5. Photos & Video Tours</span>
            </h3>

            {/* Add Image URL */}
            <div className="space-y-3">
              <label className="text-xs text-slate-300 font-semibold">Add Property Image URL</label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Button type="button" size="sm" onClick={handleAddImage}>Add Image</Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative h-24 rounded-xl overflow-hidden border border-slate-800 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full text-xs opacity-80 hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Submit Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleSubmit("DRAFT")}
              className="w-full sm:w-auto"
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit("PENDING_VERIFICATION")}
              className="w-full sm:w-auto gap-2"
            >
              <Upload className="h-4 w-4" />
              Submit for Admin Verification
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
