import { Metadata } from "next";
import { propertyService } from "@/services/property.service";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { PLATFORM_SETTINGS } from "@/config/business-rules.config";
import {
  PropertyImageGallery,
  PriceDisplay,
  AmenityBadge,
  VerifiedBadge,
  RoomCard,
  ReviewCard,
  VisitScheduleWidget,
  PropertyMap,
  PropertyUnlockButton,
} from "@/components/common";
import { VisitRequestSection } from "@/components/common/VisitRequestSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  CalendarCheck,
  CheckCircle2,
  User,
  Star,
  Phone,
  MessageSquare,
  Building,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const authUser = await getAuthenticatedUser();
  const property = await propertyService.getPropertyById(
    resolvedParams.id,
    authUser?.id,
    authUser?.role,
    authUser?.ownerId
  );
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://roomsplits.com";

  if (!property) {
    return {
      title: "Property Not Found | RoomSplits",
      description: "The requested property listing could not be found.",
    };
  }

  const title = `${property.title} - ${property.category.toUpperCase()} in ${property.location.locality}, ${property.location.city} | RoomSplits`;
  const description = `${property.description.slice(0, 160)}... Starting at ₹${property.startingPrice.toLocaleString("en-IN")}/mo. Verified PG & Co-Living in ${property.location.city}.`;
  const propertyUrl = `${baseUrl}/property/${property.id}`;
  const ogImage = property.coverImage || property.images[0] || `${baseUrl}/og-image.jpg`;

  return {
    title,
    description,
    keywords: [
      property.title,
      `${property.category} in ${property.location.city}`,
      `${property.category} in ${property.location.locality}`,
      `PG for ${property.genderPolicy}`,
      "RoomSplits verified PG",
    ],
    openGraph: {
      title,
      description,
      url: propertyUrl,
      siteName: "RoomSplits",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const authUser = await getAuthenticatedUser();
  const property = await propertyService.getPropertyById(
    resolvedParams.id,
    authUser?.id,
    authUser?.role,
    authUser?.ownerId
  );

  if (!property) {
    notFound();
  }

  const sampleReviews = [
    {
      id: "rev-1",
      propertyId: property.id,
      tenantId: "t-1",
      tenantName: "Ananya Roy",
      rating: 4.9,
      cleanlinessRating: 5,
      foodRating: 4.8,
      amenitiesRating: 5,
      valueForMoneyRating: 4.9,
      comment: "Gourmet daily food quality and super fast WiFi for remote software work!",
      isVerifiedResident: true,
      createdAt: "3 days ago",
    },
    {
      id: "rev-2",
      propertyId: property.id,
      tenantId: "t-2",
      tenantName: "Vikram Malhotra",
      rating: 4.8,
      cleanlinessRating: 4.9,
      foodRating: 4.7,
      amenitiesRating: 5,
      valueForMoneyRating: 4.8,
      comment: "Spacious rooms with daily housekeeping. Quiet and safe location.",
      isVerifiedResident: true,
      createdAt: "1 week ago",
    },
  ];

  // PUBLIC JSON-LD STRUCTURED DATA (Omitted exact address, coordinates, or owner phone)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SingleFamilyResidence",
    name: property.title,
    description: property.description,
    image: property.images,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.location.locality,
      addressRegion: property.location.state || "Jharkhand",
      postalCode: property.location.pincode,
      addressCountry: "IN",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: property.rating,
      reviewCount: property.reviewCount,
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <VerifiedBadge type="property" />
            <Badge variant="secondary" className="uppercase text-[10px]">{property.genderPolicy}</Badge>
            <Badge variant="outline" className="capitalize text-[10px]">{property.category}</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{property.title}</h1>
          <p className="text-sm text-slate-400 flex items-center gap-1">
            <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              {property.isUnlocked
                ? `${property.location.address}, ${property.location.locality}, ${property.location.city} - ${property.location.pincode}`
                : `${property.location.locality}, ${property.location.city} - ${property.location.pincode}`}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <PriceDisplay amount={property.startingPrice} size="lg" />
          <div className="flex gap-2">
            <Link href="#schedule-visit">
              <Button variant="outline" size="lg" className="gap-2">
                <CalendarCheck className="h-4 w-4 text-emerald-400" />
                Schedule Visit
              </Button>
            </Link>
            <Link href="#room-options">
              <Button size="lg" className="gap-2">
                Book Room
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Property Access Control Banner */}
      <PropertyUnlockButton
        propertyId={property.id}
        propertyTitle={property.title}
        isUnlocked={Boolean(property.isUnlocked)}
        isLoggedIn={Boolean(authUser)}
        variant="banner"
      />
      {property.isUnlocked && property.ownerContact?.phone && (
        <Card className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>✓ Property Unlocked ({PLATFORM_SETTINGS.VISIT_PASS_LABEL}) &bull; Full Details &amp; Contact Active</span>
            </div>
            <p className="text-[11px] text-slate-300">
              {PLATFORM_SETTINGS.UNLOCK_PRICE_LABEL} unlock gives you access to property details and visit information. It does not reserve or book a room.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href={`tel:${property.ownerContact.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold hover:bg-emerald-500/30">
              <Phone className="h-3.5 w-3.5" />
              <span>{property.ownerContact.phone}</span>
            </a>
            {property.ownerContact?.whatsapp && (
              <a
                href={`https://wa.me/${property.ownerContact.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </Card>
      )}

      {/* Image Gallery */}
      <PropertyImageGallery images={property.images} title={property.title} />

      {/* Grid Layout: Main Details vs Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-10">
          {/* Description */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-white">About the Property</h3>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {property.description}
            </p>
          </section>

          {/* Room Sharing Options */}
          <section id="room-options" className="space-y-4">
            <h3 className="text-xl font-bold text-white">Room Sharing Options &amp; Monthly Rent</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {property.roomOptions.length > 0 ? (
                property.roomOptions.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))
              ) : (
                <>
                  <RoomCard
                    room={{
                      id: "r-single",
                      sharingType: "single",
                      monthlyRent: property.startingPrice * 1.4,
                      securityDeposit: property.startingPrice * 2.8,
                      availableBeds: 1,
                      totalBeds: 2,
                      hasAttachedBathroom: true,
                      hasBalcony: true,
                    }}
                  />
                  <RoomCard
                    room={{
                      id: "r-double",
                      sharingType: "double",
                      monthlyRent: property.startingPrice,
                      securityDeposit: property.startingPrice * 2,
                      availableBeds: 3,
                      totalBeds: 6,
                      hasAttachedBathroom: true,
                      hasBalcony: false,
                    }}
                  />
                </>
              )}
            </div>
          </section>

          {/* Amenities */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-white">Included Amenities &amp; Services</h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity) => (
                <AmenityBadge key={amenity} name={amenity} showIcon />
              ))}
            </div>
          </section>

          {/* Property Rules */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-white">House Rules &amp; Terms</h3>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Lock-in Period</span>
                <strong className="text-white">{property.lockInMonths} Months</strong>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Notice Period</span>
                <strong className="text-white">{property.noticePeriodDays} Days</strong>
              </div>
              <ul className="space-y-1.5 pt-2">
                {property.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Private Visit Instructions (Unlocked Only) */}
          {property.isUnlocked && property.ownerContact?.visitInstructions && (
            <section className="space-y-3">
              <h3 className="text-xl font-bold text-white">Private Visit Instructions</h3>
              <Card className="p-5 bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Building className="h-4 w-4 text-emerald-400" />
                  <span>Host Access Note</span>
                </div>
                <p className="leading-relaxed">
                  {property.ownerContact.visitInstructions}
                </p>
              </Card>
            </section>
          )}

          {/* Request Visit Section */}
          <section className="space-y-3">
            <VisitRequestSection
              propertyId={property.id}
              propertyTitle={property.title}
              isUnlocked={Boolean(property.isUnlocked)}
              isLoggedIn={Boolean(authUser)}
            />
          </section>

          {/* Map Section */}
          <section className="space-y-3">
            <PropertyMap
              title={property.title}
              location={{
                latitude: property.isUnlocked ? property.location.latitude : undefined,
                longitude: property.isUnlocked ? property.location.longitude : undefined,
                formatted_address: property.isUnlocked
                  ? `${property.location.address}, ${property.location.locality}, ${property.location.city}`
                  : `Approximate Locality (${property.location.locality}, ${property.location.city})`,
                city: property.location.city,
                state: property.location.state || "Jharkhand",
                pincode: property.location.pincode,
              }}
              isExactLocationVisible={Boolean(property.isUnlocked)}
            />
          </section>

          {/* Reviews Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Resident Reviews</h3>
              <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                <Star className="h-4 w-4 fill-amber-400" />
                <span>{property.rating} ({property.reviewCount} reviews)</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleReviews.map((rev) => (
                <ReviewCard key={rev.id} review={rev} />
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar: Owner Info & Sticky Booking Widget */}
        <div className="space-y-6">
          {/* Owner Info Card */}
          <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">
                  {property.ownerContact?.ownerName || "RoomSplits Verified Host"}
                </h4>
                <VerifiedBadge type="owner" />
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span>Response Time</span>
                <span className="font-semibold text-emerald-400">&lt; 15 mins</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Physical Visits Handled</span>
                <span className="font-semibold text-white">340+</span>
              </div>
            </div>
          </Card>

          {/* Schedule Visit Sticky Action Box */}
          <VisitScheduleWidget property={property} />
        </div>
      </div>
    </div>
  );
}
