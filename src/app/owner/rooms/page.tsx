"use client";

import { useState, useEffect, useCallback } from "react";
import { ownerService, OwnerProperty } from "@/services/owner.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RoomOption, SharingType } from "@/types";
import { Plus, Bed, Bath, Wind } from "lucide-react";

export default function OwnerRoomsPage() {
  const [properties, setProperties] = useState<OwnerProperty[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New room form state
  const [roomNumber, setRoomNumber] = useState("");
  const [sharingType, setSharingType] = useState<SharingType>("double");
  const [monthlyRent, setMonthlyRent] = useState(12000);
  const [securityDeposit, setSecurityDeposit] = useState(24000);
  const [totalBeds, setTotalBeds] = useState(4);
  const [availableBeds, setAvailableBeds] = useState(2);
  const [hasAttachedBathroom, setHasAttachedBathroom] = useState(true);
  const [hasBalcony, setHasBalcony] = useState(true);

  const loadData = useCallback(async () => {
    const props = await ownerService.getProperties();
    setProperties(props);
    if (props.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(props[0].id);
    }
  }, [selectedPropertyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeProperty = properties.find((p) => p.id === selectedPropertyId) || properties[0];

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProperty || !roomNumber) {
      alert("Please enter a valid room number/name.");
      return;
    }

    const newRoom: RoomOption = {
      id: `r-${Date.now()}`,
      sharingType,
      monthlyRent: Number(monthlyRent),
      securityDeposit: Number(securityDeposit),
      totalBeds: Number(totalBeds),
      availableBeds: Number(availableBeds),
      hasAttachedBathroom,
      hasBalcony,
    };

    try {
      await ownerService.addRoomToProperty(activeProperty.id, newRoom);
      await loadData();
      setIsAddModalOpen(false);
      setRoomNumber("");
      alert("Room created successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create room.";
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="owner" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="accent" className="mb-2">Bed Occupancy</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Room & Bed Management</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Configure room types, monthly rents, security deposits, and live vacant bed availability.</p>
          </div>

          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Room
          </Button>
        </div>

        {/* Property Selector Selector */}
        {properties.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium">Selected Property</span>
              <h3 className="text-lg font-bold text-white">{activeProperty?.title}</h3>
            </div>
            <div className="w-full sm:w-72">
              <Select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                options={properties.map((p) => ({ value: p.id, label: p.title }))}
              />
            </div>
          </div>
        )}

        {/* Rooms Grid */}
        {activeProperty?.roomOptions && activeProperty.roomOptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProperty.roomOptions.map((room) => (
              <Card key={room.id} className="border-slate-800 bg-slate-900/80 p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="font-bold text-base text-white capitalize">
                        {room.sharingType} Sharing
                      </h4>
                      <span className="text-xs text-slate-400">Room ID: {room.id}</span>
                    </div>
                    <Badge variant={room.availableBeds > 0 ? "accent" : "danger"} className="text-[10px]">
                      {room.availableBeds > 0 ? `${room.availableBeds} Vacant` : "Fully Occupied"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Monthly Rent</span>
                      <strong className="text-emerald-400 font-bold text-sm">₹{room.monthlyRent}</strong>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Security Deposit</span>
                      <strong className="text-white font-bold text-sm">₹{room.securityDeposit}</strong>
                    </div>
                  </div>

                  {/* Bed Occupancy Progress */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs text-slate-300 font-medium">
                      <span>Beds Occupancy</span>
                      <span>{room.totalBeds - room.availableBeds} / {room.totalBeds} Occupied</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${((room.totalBeds - room.availableBeds) / room.totalBeds) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5 pt-2 text-[11px] text-slate-300">
                    {room.hasAttachedBathroom && (
                      <span className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                        <Bath className="h-3 w-3 text-emerald-400" />
                        Attached Bath
                      </span>
                    )}
                    {room.hasBalcony && (
                      <span className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                        <Wind className="h-3 w-3 text-cyan-400" />
                        Balcony
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
            <Bed className="h-10 w-10 text-slate-500 mx-auto" />
            <h3 className="font-bold text-lg text-white">No Rooms Configured Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your first room option (single, double, triple sharing) to enable online student bookings.
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>Add Room</Button>
          </Card>
        )}

        {/* Modal for Adding New Room */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-lg text-white">Add New Room Option</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Room Number / Name *</label>
                  <Input placeholder="e.g. Room 204 or Block A-1" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Room Type / Sharing *</label>
                  <Select
                    value={sharingType}
                    onChange={(e) => setSharingType(e.target.value as SharingType)}
                    options={[
                      { value: "single", label: "Single Private Room" },
                      { value: "double", label: "Double Sharing" },
                      { value: "triple", label: "Triple Sharing" },
                      { value: "four_plus", label: "Four+ Bed Dormitory" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Monthly Rent (₹)</label>
                    <Input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Security Deposit (₹)</label>
                    <Input type="number" value={securityDeposit} onChange={(e) => setSecurityDeposit(Number(e.target.value))} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Total Beds</label>
                    <Input type="number" value={totalBeds} onChange={(e) => setTotalBeds(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Vacant Beds</label>
                    <Input type="number" value={availableBeds} onChange={(e) => setAvailableBeds(Number(e.target.value))} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasAttachedBathroom}
                      onChange={(e) => setHasAttachedBathroom(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span>Attached Bathroom</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasBalcony}
                      onChange={(e) => setHasBalcony(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span>Balcony</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Room</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
