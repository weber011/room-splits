"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ownerService, OwnerProperty } from "@/services/owner.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCategory, GenderPolicy } from "@/types";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [property, setProperty] = useState<OwnerProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<PropertyCategory>("coliving");
  const [genderPolicy, setGenderPolicy] = useState<GenderPolicy>("unisex");
  const [startingPrice, setStartingPrice] = useState(10000);
  const [lockInMonths, setLockInMonths] = useState(3);
  const [noticePeriodDays, setNoticePeriodDays] = useState(30);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const prop = await ownerService.getPropertyById(resolvedParams.id);
      if (prop) {
        setProperty(prop);
        setTitle(prop.title);
        setDescription(prop.description);
        setCategory(prop.category);
        setGenderPolicy(prop.genderPolicy);
        setStartingPrice(prop.startingPrice);
        setLockInMonths(prop.lockInMonths);
        setNoticePeriodDays(prop.noticePeriodDays);
      }
      setIsLoading(false);
    }
    loadData();
  }, [resolvedParams.id]);

  const handleSave = async () => {
    if (!property) return;
    setIsSaving(true);
    try {
      await ownerService.updateProperty(property.id, {
        title,
        description,
        category,
        genderPolicy,
        startingPrice: Number(startingPrice),
        lockInMonths: Number(lockInMonths),
        noticePeriodDays: Number(noticePeriodDays),
      });
      alert("Property updated successfully!");
      router.push("/owner/properties");
    } catch {
      alert("Failed to update property.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestVerification = async () => {
    if (!property) return;
    await ownerService.submitForVerification(property.id);
    const updated = await ownerService.getPropertyById(property.id);
    if (updated) setProperty(updated);
    alert("Property submitted for Admin Verification.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex">
        <DashboardSidebar role="owner" />
        <main className="flex-1 p-8 space-y-6">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex">
        <DashboardSidebar role="owner" />
        <main className="flex-1 p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">Property Not Found</h2>
          <Button onClick={() => router.push("/owner/properties")}>Back to Properties</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="owner" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => router.back()} className="gap-1 text-slate-400">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Badge
                variant={
                  property.status === "VERIFIED"
                    ? "accent"
                    : property.status === "PENDING_VERIFICATION"
                    ? "warning"
                    : "secondary"
                }
                className="uppercase text-[10px]"
              >
                {property.status}
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Edit: {property.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            {property.status === "DRAFT" && (
              <Button size="sm" variant="warning" onClick={handleRequestVerification}>
                Submit Verification
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Status Notice */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Verification Status</span>
            <strong className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{property.status}</span>
            </strong>
          </div>
          <span className="text-xs text-slate-400 max-w-md text-right">
            Verification badges can only be approved by RoomSplits System Administrators.
          </span>
        </div>

        {/* Form Card */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Property Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Category</label>
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
              <label className="text-xs text-slate-300 font-semibold">Gender Policy</label>
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
              <label className="text-xs text-slate-300 font-semibold">Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Starting Rent (₹/mo)</label>
              <Input type="number" value={startingPrice} onChange={(e) => setStartingPrice(Number(e.target.value))} />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Lock-In Months</label>
              <Input type="number" value={lockInMonths} onChange={(e) => setLockInMonths(Number(e.target.value))} />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Notice Period (Days)</label>
              <Input type="number" value={noticePeriodDays} onChange={(e) => setNoticePeriodDays(Number(e.target.value))} />
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
