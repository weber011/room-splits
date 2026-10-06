"use client";

import { useState, useEffect } from "react";
import { ownerService, OwnerDocument } from "@/services/owner.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Shield, FileText } from "lucide-react";

export default function OwnerAccountPage() {
  const [documents, setDocuments] = useState<OwnerDocument[]>([]);
  const [businessName, setBusinessName] = useState("UrbanNest Living Solutions Pvt Ltd");
  const [gstin, setGstin] = useState("29ABCDE1234F1Z5");
  const [bankAccount, setBankAccount] = useState("987654321099");
  const [ifsc, setIfsc] = useState("HDFC0001234");
  const [selectedDocType, setSelectedDocType] = useState<OwnerDocument["documentType"]>("aadhaar");
  const [isUploading, setIsUploading] = useState(false);

  const loadDocs = async () => {
    const data = await ownerService.getDocuments();
    setDocuments(data);
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await ownerService.uploadDocument(selectedDocType, file);
      await loadDocs();
      alert(`Document uploaded for ${selectedDocType.toUpperCase()}! Submitted for Admin KYC verification.`);
    } catch {
      alert("Document upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="owner" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="accent" className="mb-2">Owner Identity & KYC</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Account & Legal Verification</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Submit government KYC documents and banking details to receive rent disbursements.</p>
          </div>
        </div>

        {/* Verification Alert Notice */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
          <Shield className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-white text-sm">Owner KYC Status: Pending Admin Verification</h4>
            <p className="text-slate-300">
              Your property verification badges and payouts are tied to your KYC documents (Aadhaar, PAN, and Property Title Deed).
            </p>
          </div>
        </div>

        {/* Business & Banking Details */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-6">
          <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-3">Business & Bank Payout Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Registered Business Name</label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">GSTIN Number (Optional)</label>
              <Input value={gstin} onChange={(e) => setGstin(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Bank Account Number</label>
              <Input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Bank IFSC Code</label>
              <Input value={ifsc} onChange={(e) => setIfsc(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => alert("Bank payout details updated!")}>Save Banking Details</Button>
          </div>
        </Card>

        {/* Document Upload Section */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-6">
          <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-3">Government & Property KYC Documents</h3>

          {/* Upload Widget */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="font-bold text-sm text-white">Upload New Document</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Select Document Type</label>
                <Select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value as OwnerDocument["documentType"])}
                  options={[
                    { value: "aadhaar", label: "Aadhaar Card" },
                    { value: "pan", label: "PAN Card" },
                    { value: "electricity_bill", label: "Utility / Electricity Bill" },
                    { value: "title_deed", label: "Property Title Deed / Lease" },
                  ]}
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-300 font-semibold">Upload File (PDF / JPG / PNG)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white">Uploaded Verification Documents</h4>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-400" />
                    <div>
                      <h5 className="font-bold text-white uppercase">{doc.documentType.replace("_", " ")}</h5>
                      <span className="text-slate-400 text-[10px]">Uploaded: {doc.uploadedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={doc.isVerified ? "accent" : "warning"} className="uppercase text-[9px]">
                      {doc.isVerified ? "Verified by Admin" : "Pending Admin Review"}
                    </Badge>
                    <a
                      href={doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      View File
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
