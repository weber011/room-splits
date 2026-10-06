"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function AdminOwnerVerificationPage() {
  const [pendingDocs, setPendingDocs] = useState([
    { id: "doc-1", ownerName: "Vikram Malhotra", docType: "Aadhaar Card", url: "https://example.com/docs/aadhaar.pdf", date: "2026-10-01", status: "VERIFIED" },
    { id: "doc-2", ownerName: "Vikram Malhotra", docType: "PAN Card", url: "https://example.com/docs/pan.pdf", date: "2026-10-01", status: "VERIFIED" },
    { id: "doc-3", ownerName: "Karan Johar", docType: "Property Title Deed", url: "https://example.com/docs/deed.pdf", date: "2026-10-03", status: "PENDING" },
    { id: "doc-4", ownerName: "Karan Johar", docType: "Electricity Bill", url: "https://example.com/docs/ebill.pdf", date: "2026-10-04", status: "PENDING" },
  ]);

  const handleApproveDoc = (id: string) => {
    setPendingDocs(pendingDocs.map((d) => (d.id === id ? { ...d, status: "VERIFIED" } : d)));
    alert("Document KYC approved!");
  };

  const handleRejectDoc = (id: string) => {
    setPendingDocs(pendingDocs.map((d) => (d.id === id ? { ...d, status: "REJECTED" } : d)));
    alert("Document rejected.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">KYC Portal</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Owner Document Verification Queue</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Audit uploaded identity and property ownership deeds before granting verified status.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingDocs.map((doc) => (
            <Card key={doc.id} className="border-slate-800 bg-slate-900/80 p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-emerald-400 uppercase tracking-wide">{doc.docType}</span>
                  <Badge variant={doc.status === "VERIFIED" ? "accent" : doc.status === "PENDING" ? "warning" : "danger"} className="text-[10px]">
                    {doc.status}
                  </Badge>
                </div>
                <h4 className="font-bold text-base text-white">{doc.ownerName}</h4>
                <p className="text-xs text-slate-400">Submitted: {doc.date}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  View Document File
                </a>

                {doc.status === "PENDING" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" onClick={() => handleApproveDoc(doc.id)}>
                      Approve KYC
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRejectDoc(doc.id)} className="text-rose-400">
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
