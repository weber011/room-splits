import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { propertyService } from "@/services/property.service";
import { propertyUnlockService } from "@/services/property-unlock.service";
import { paymentService } from "@/services/payment.service";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user session
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to unlock property." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { propertyId } = body;

    if (!propertyId || typeof propertyId !== "string") {
      return NextResponse.json(
        { error: "Property ID is required." },
        { status: 400 }
      );
    }

    // 2. Pre-Check: Fetch & Validate Property
    const property = await propertyService.getPropertyById(propertyId, user.id, user.role, user.ownerId);
    if (!property) {
      return NextResponse.json(
        { error: "Property not found or is not available for discovery." },
        { status: 404 }
      );
    }

    // 3. Pre-Check: Verify if user already holds an ACTIVE unlock for this property
    const isAlreadyUnlocked = await propertyUnlockService.hasUserUnlockedProperty(user.id, propertyId);
    if (isAlreadyUnlocked) {
      return NextResponse.json(
        {
          isAlreadyUnlocked: true,
          message: "You already hold an active access pass for this property.",
        },
        { status: 200 }
      );
    }

    // 4. Create Server-Side Razorpay Order for PROPERTY_UNLOCK (₹9 resolved server-side)
    const checkoutData = await paymentService.createRazorpayOrder({
      userId: user.id,
      paymentType: "PROPERTY_UNLOCK",
      relatedPropertyId: propertyId,
      metadata: {
        propertyTitle: property.title,
        locality: property.location?.locality,
        city: property.location?.city,
      },
    });

    // 5. Return Safe Checkout Response (Secrets NEVER returned)
    return NextResponse.json(checkoutData, { status: 200 });
  } catch (error: unknown) {
    console.error("[Property Unlock Order API Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to create property unlock payment order.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
