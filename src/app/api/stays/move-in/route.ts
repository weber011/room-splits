import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { stayService } from "@/services/stay.service";

export async function POST(req: NextRequest) {
  try {
    // 1. Server-side session authentication check
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to confirm move-in." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { bookingId, moveInDate } = body;

    if (!bookingId || typeof bookingId !== "string") {
      return NextResponse.json(
        { success: false, error: "Booking ID is required." },
        { status: 400 }
      );
    }

    // 2. Perform Move-in confirmation with server-side authorization & validation
    const result = await stayService.confirmMoveIn({
      bookingId,
      userId: user.id,
      userRole: user.role,
      moveInDate,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          stay: result.stay,
        },
        { status: result.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        stay: result.stay,
      },
      { status: result.statusCode }
    );
  } catch (error: unknown) {
    console.error("[Move-In API Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to confirm move-in.";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
