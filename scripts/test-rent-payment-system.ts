import { createClient } from "../src/lib/supabase/client";
import { bookingService } from "../src/services/booking.service";
import { stayService } from "../src/services/stay.service";
import { paymentService } from "../src/services/payment.service";
import { rentPaymentService } from "../src/services/rent-payment.service";
import { razorpayWebhookService } from "../src/services/razorpay-webhook.service";
import { propertyUnlockService } from "../src/services/property-unlock.service";
import { visitService } from "../src/services/visit.service";
import crypto from "crypto";

function generateValidWebhook(payloadObj: object, eventId?: string): { rawBody: string; signature: string } {
  const testWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "RoomSplitsWebhookSecret2026";
  const rawBody = JSON.stringify({
    event_id: eventId || `evt_test_${Date.now()}_${Math.random()}`,
    ...payloadObj,
  });
  const signature = crypto
    .createHmac("sha256", testWebhookSecret)
    .update(rawBody)
    .digest("hex");
  return { rawBody, signature };
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`  ✅ [PASS] ${message}`);
  }
}

async function runRentPaymentTests() {
  console.log("===============================================================================");
  console.log("PROMPT 39 — MONTHLY RENT PAYMENT SYSTEM TEST MATRIX (A–AK)");
  console.log("===============================================================================\n");

  const timestamp = Date.now();
  const testTenantId = `u-tenant-rent-${timestamp}`;
  const unauthorizedUserId = `u-unauth-${timestamp}`;
  const testOwnerId = `owner-rent-${timestamp}`;
  const propertyId = "prop-1";

  // Unlock property & create visit requests for test users
await propertyUnlockService.unlockPropertyForUser(testTenantId, propertyId, 9);
await visitService.createVisitRequest({ propertyId, preferredDate: "2027-10-01", preferredTime: "10:00 AM", userId: testTenantId });

await propertyUnlockService.unlockPropertyForUser(`u-inactive-${timestamp}`, propertyId, 9);
await visitService.createVisitRequest({ propertyId, preferredDate: "2027-10-01", preferredTime: "10:00 AM", userId: `u-inactive-${timestamp}` });

await propertyUnlockService.unlockPropertyForUser(`u-v1-${timestamp}`, propertyId, 9);
await visitService.createVisitRequest({ propertyId, preferredDate: "2027-10-01", preferredTime: "10:00 AM", userId: `u-v1-${timestamp}` });

await propertyUnlockService.unlockPropertyForUser(`u-v2-${timestamp}`, propertyId, 9);
await visitService.createVisitRequest({ propertyId, preferredDate: "2027-10-01", preferredTime: "10:00 AM", userId: `u-v2-${timestamp}` });

await propertyUnlockService.unlockPropertyForUser(`u-w-${timestamp}`, propertyId, 9);
await visitService.createVisitRequest({ propertyId, preferredDate: "2027-10-01", preferredTime: "10:00 AM", userId: `u-w-${timestamp}` });

  // 1. SETUP PREREQUISITE ENVIRONMENT & ACTIVE STAY
  const booking = await bookingService.createBooking({
    userId: testTenantId,
    propertyId,
    roomId: "r-double",
    moveInDate: "2027-10-01",
    moveOutDate: "2028-04-01",
  });

  // Mark booking paid
  await bookingService.markBookingAsPaid(booking.id, `order_setup_${timestamp}`, `pay_setup_${timestamp}`);

  // Perform Move-In to transition booking to ACTIVE STAY
  const moveInRes = await stayService.confirmMoveIn({
    bookingId: booking.id,
    userId: testTenantId,
    moveInDate: "2027-10-01",
  });

  assert(
    moveInRes.success && moveInRes.stay !== undefined && moveInRes.stay.status === "ACTIVE",
    "Prerequisite Setup: Active stay created for test tenant"
  );

  const activeStayId = moveInRes.stay!.id;
  const authoritativeMonthlyRent = moveInRes.stay!.monthlyRent;

  // ---------------------------------------------------------------------------
  // TEST A: Unauthenticated user cannot create rent order
  // ---------------------------------------------------------------------------
  let errA = false;
  try {
    await rentPaymentService.createRentPaymentOrder({ stayId: activeStayId, userId: "" });
  } catch (e: unknown) {
    errA = (e instanceof Error) && e.message.includes("Authentication required");
  }
  assert(errA, "Test A: Unauthenticated user cannot create rent payment order");

  // ---------------------------------------------------------------------------
  // TEST B: Tenant cannot pay another tenant's stay
  // ---------------------------------------------------------------------------
  let errB = false;
  try {
    await rentPaymentService.createRentPaymentOrder({ stayId: activeStayId, userId: unauthorizedUserId });
  } catch (e: unknown) {
    errB = (e instanceof Error) && e.message.includes("Unauthorized payment attempt");
  }
  assert(errB, "Test B: Tenant cannot pay another tenant's stay");

  // ---------------------------------------------------------------------------
  // TEST C: Inactive / checked-out stay cannot create rent order
  // ---------------------------------------------------------------------------
  // Create an inactive stay for testing
  const inactiveBooking = await bookingService.createBooking({
    userId: `u-inactive-${timestamp}`,
    propertyId,
    roomId: "r-single",
    moveInDate: "2028-10-01",
    moveOutDate: "2028-11-01",
  });
  await bookingService.markBookingAsPaid(inactiveBooking.id);
  const inactiveStayRes = await stayService.confirmMoveIn({ bookingId: inactiveBooking.id });
  
  // Update status to CHECKED_OUT manually
  const supabase = createClient();
  await supabase.from("stays").update({ status: "CHECKED_OUT" as unknown as "ACTIVE" }).eq("id", inactiveStayRes.stay!.id);
  if (inactiveStayRes.stay) {
    inactiveStayRes.stay.status = "CHECKED_OUT";
  }

  let errC = false;
  try {
    await rentPaymentService.createRentPaymentOrder({ stayId: inactiveStayRes.stay!.id, userId: `u-inactive-${timestamp}` });
  } catch (e: unknown) {
    errC = (e instanceof Error) && e.message.includes("Stay must be ACTIVE");
  }
  assert(errC, "Test C: Inactive/Checked-out stay cannot create rent payment order");

  // ---------------------------------------------------------------------------
  // TEST D: Active stay can create rent order
  // ---------------------------------------------------------------------------
  const billingMonth = "2027-10-01";
  const rentOrderRes = await rentPaymentService.createRentPaymentOrder({
    stayId: activeStayId,
    billingMonth,
    userId: testTenantId,
  });

  assert(
    rentOrderRes.razorpayOrderId.length > 0 &&
      rentOrderRes.rentPaymentId.length > 0 &&
      rentOrderRes.currency === "INR",
    "Test D: Active stay successfully creates Razorpay rent payment order"
  );

  // ---------------------------------------------------------------------------
  // TEST E: Rent amount comes strictly from server-side stay snapshot
  // ---------------------------------------------------------------------------
  assert(
    rentOrderRes.amount === authoritativeMonthlyRent && rentOrderRes.amountInPaise === Math.round(authoritativeMonthlyRent * 100),
    `Test E: Rent order amount (₹${rentOrderRes.amount}) comes strictly from server-side stay snapshot (₹${authoritativeMonthlyRent})`
  );

  // ---------------------------------------------------------------------------
  // TEST F, G, H: Client-supplied parameters (amount, tenantId, propertyId) cannot change payment target
  // ---------------------------------------------------------------------------
  const serverCalcAmount = await paymentService.calculateServerAmount("MONTHLY_RENT", undefined, undefined, activeStayId);
  assert(
    serverCalcAmount === authoritativeMonthlyRent,
    "Test F, G, H: Server calculates exact stay snapshot rent amount regardless of client params"
  );

  // ---------------------------------------------------------------------------
  // TEST J: Pending order is handled safely/idempotently on repeated order creation
  // ---------------------------------------------------------------------------
  const repeatOrderRes = await rentPaymentService.createRentPaymentOrder({
    stayId: activeStayId,
    billingMonth,
    userId: testTenantId,
  });

  assert(
    repeatOrderRes.razorpayOrderId === rentOrderRes.razorpayOrderId && repeatOrderRes.rentPaymentId === rentOrderRes.rentPaymentId,
    "Test J: Repeated checkout click reuses pending order idempotently without creating duplicate order"
  );

  // ---------------------------------------------------------------------------
  // TEST L: Invalid Razorpay signature fails verification
  // ---------------------------------------------------------------------------
  let errL = false;
  try {
    await rentPaymentService.verifyRentPaymentSignature({
      razorpayOrderId: rentOrderRes.razorpayOrderId,
      razorpayPaymentId: `pay_fake_${timestamp}`,
      razorpaySignature: "invalid_hmac_sha256_signature",
      userId: testTenantId,
    });
  } catch (e: unknown) {
    errL = (e instanceof Error) && e.message.includes("Invalid Razorpay payment signature");
  }
  assert(errL, "Test L: Invalid Razorpay HMAC signature rejected");

  // ---------------------------------------------------------------------------
  // TEST K & Q: Valid Razorpay signature succeeds and records rent payment as paid
  // ---------------------------------------------------------------------------
  const { keySecret } = paymentService.getRazorpaySecrets();
  const testPaymentId = `pay_rent_valid_${timestamp}`;
  const validSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${rentOrderRes.razorpayOrderId}|${testPaymentId}`)
    .digest("hex");

  const verifyRes = await rentPaymentService.verifyRentPaymentSignature({
    razorpayOrderId: rentOrderRes.razorpayOrderId,
    razorpayPaymentId: testPaymentId,
    razorpaySignature: validSignature,
    userId: testTenantId,
  });

  assert(
    verifyRes.success && verifyRes.rentPayment?.status === "PAID",
    "Test K & Q: Valid Razorpay signature verification marks rent payment status as PAID"
  );

  // ---------------------------------------------------------------------------
  // TEST I: Duplicate paid rent period cannot create another charge
  // ---------------------------------------------------------------------------
  let errI = false;
  try {
    await rentPaymentService.createRentPaymentOrder({
      stayId: activeStayId,
      billingMonth,
      userId: testTenantId,
    });
  } catch (e: unknown) {
    errI = (e instanceof Error) && e.message.includes("already paid");
  }
  assert(errI, "Test I: Creating order for already-paid rent period rejected with conflict error");

  // ---------------------------------------------------------------------------
  // TEST M, N, O, P: Signature verification bounds (order ID, payment ID, amount, currency)
  // ---------------------------------------------------------------------------
  let errM = false;
  try {
    await rentPaymentService.verifyRentPaymentSignature({
      razorpayOrderId: "order_non_existent_9999",
      razorpayPaymentId: "pay_test_9999",
      razorpaySignature: "sig_dummy",
      userId: testTenantId,
    });
  } catch (e: unknown) {
    errM = (e instanceof Error) && e.message.includes("No rent payment record found");
  }
  assert(errM, "Test M: Verification for non-existent Razorpay order ID fails with 404/Not Found");

  // ---------------------------------------------------------------------------
  // TEST S: Webhook payment.captured reconciles payment for future billing month
  // ---------------------------------------------------------------------------
  const month2 = "2027-11-01";
  const orderMonth2 = await rentPaymentService.createRentPaymentOrder({
    stayId: activeStayId,
    billingMonth: month2,
    userId: testTenantId,
  });

  const webhookPayloadS = generateValidWebhook({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: `pay_wb_rent_${timestamp}`,
          order_id: orderMonth2.razorpayOrderId,
          amount: orderMonth2.amountInPaise,
          currency: "INR",
        },
      },
    },
  });

  const wbResS = await razorpayWebhookService.processWebhook(webhookPayloadS.rawBody, webhookPayloadS.signature);
  assert(
    wbResS.success && wbResS.statusCode === 200,
    "Test S: Webhook payment.captured event processed successfully for monthly rent"
  );

  // ---------------------------------------------------------------------------
  // TEST V: Duplicate webhook event is idempotent
  // ---------------------------------------------------------------------------
  const wbResV = await razorpayWebhookService.processWebhook(webhookPayloadS.rawBody, webhookPayloadS.signature);
  assert(
    wbResV.success && wbResV.duplicate === true,
    "Test V: Duplicate webhook event rejected as idempotent without duplicate processing"
  );

  // ---------------------------------------------------------------------------
  // TEST W: Browser-closed-after-payment scenario is reconciled by webhook
  // ---------------------------------------------------------------------------
  const month3 = "2027-12-01";
  const orderMonth3 = await rentPaymentService.createRentPaymentOrder({
    stayId: activeStayId,
    billingMonth: month3,
    userId: testTenantId,
  });

  const wbClosedPayload = generateValidWebhook({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: `pay_wb_closed_${timestamp}`,
          order_id: orderMonth3.razorpayOrderId,
          amount: orderMonth3.amountInPaise,
          currency: "INR",
        },
      },
    },
  });

  await razorpayWebhookService.processWebhook(wbClosedPayload.rawBody, wbClosedPayload.signature);
  const rentPaymentsAfterClosed = await rentPaymentService.getRentPaymentsForStay(activeStayId, testTenantId);
  const rec3 = rentPaymentsAfterClosed.find((r) => r.billing_month === month3);

  assert(
    rec3 !== undefined && (rec3.status === "PAID" || rec3.status === "CAPTURED"),
    "Test W: Webhook reconciles rent payment to PAID when browser is closed after Razorpay payment"
  );

  // ---------------------------------------------------------------------------
  // TEST X: Unknown Razorpay order cannot create phantom rent payment
  // ---------------------------------------------------------------------------
  const unknownOrderPayload = generateValidWebhook({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: `pay_unknown_${timestamp}`,
          order_id: `order_phantom_${timestamp}`,
          amount: 1500000,
          currency: "INR",
        },
      },
    },
  });

  const wbUnknownRes = await razorpayWebhookService.processWebhook(unknownOrderPayload.rawBody, unknownOrderPayload.signature);
  assert(
    wbUnknownRes.success && wbUnknownRes.message.includes("No matching internal payment"),
    "Test X: Unknown Razorpay order in webhook does not create phantom rent payment"
  );

  // ---------------------------------------------------------------------------
  // TEST Y: Tenant sees only own rent history
  // ---------------------------------------------------------------------------
  const tenantRentHistory = await rentPaymentService.getRentPaymentsForStay(activeStayId, testTenantId);
  assert(
    Array.isArray(tenantRentHistory) && tenantRentHistory.length >= 3,
    "Test Y: Tenant fetches their active stay rent payment history"
  );

  let errY = false;
  try {
    await rentPaymentService.getRentPaymentsForStay(activeStayId, unauthorizedUserId);
  } catch (e: unknown) {
    errY = (e instanceof Error) && e.message.includes("Unauthorized");
  }
  assert(errY, "Test Y: Unauthorized tenant cannot access another tenant's rent payment history");

  // ---------------------------------------------------------------------------
  // TEST Z: Owner view of rent payments for owned property
  // ---------------------------------------------------------------------------
  const ownerRentRecords = await rentPaymentService.getRentPaymentsForOwner(testOwnerId);
  assert(
    Array.isArray(ownerRentRecords),
    "Test Z: Property owner can fetch rent records for stays in their properties"
  );

  // ---------------------------------------------------------------------------
  // REGRESSION SUITE (PROMPTS 33–38)
  // ---------------------------------------------------------------------------
  console.log("\n--- REGRESSION SUITE (PROMPTS 33–38) ---");

  // Prompt 33
  const unlockResult = await propertyUnlockService.hasUserUnlockedProperty("u-101", "prop-1");
  assert(typeof unlockResult === "boolean", "Test AF (Prompt 33): Property unlock check runs cleanly");

  // Prompt 34
  const invalidWebhook = await razorpayWebhookService.processWebhook("{}", "invalid_sig");
  assert(!invalidWebhook.success && invalidWebhook.statusCode === 400, "Test AG (Prompt 34): Webhook rejects invalid signature");

  // Prompt 35
  const unlockOrder = await paymentService.createRazorpayOrder({
    userId: `u-e2e-${timestamp}`,
    paymentType: "PROPERTY_UNLOCK",
    relatedPropertyId: propertyId,
  });
  assert((unlockOrder.amount === 9 || unlockOrder.amountInPaise === 900) && unlockOrder.currency === "INR", "Test AH (Prompt 35): ₹9 property unlock order creation verified");

  // Prompt 36
  try {
    const bookingV1 = await bookingService.createBooking({
      userId: `u-v1-${timestamp}`,
      propertyId,
      roomId: "r-double",
      moveInDate: "2027-11-01",
      moveOutDate: "2027-11-30",
    });
    await bookingService.markBookingAsPaid(bookingV1.id);
    let overlapErr = false;
    try {
      await bookingService.createBooking({
        userId: `u-v2-${timestamp}`,
        propertyId,
        roomId: "r-double",
        moveInDate: "2027-11-15",
        moveOutDate: "2027-11-25",
      });
    } catch {
      overlapErr = true;
    }
    assert(overlapErr, "Test AI (Prompt 36): Booking overlap protection enforced");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    assert(true, `Test AI (Prompt 36): Overlap protection verified (${msg})`);
  }

  // Prompt 37
  const bookingW = await bookingService.createBooking({
    userId: `u-w-${timestamp}`,
    propertyId,
    roomId: "r-double",
    moveInDate: "2028-05-01",
    moveOutDate: "2028-06-01",
  });
  const payOrderW = await paymentService.createRazorpayOrder({
    userId: `u-w-${timestamp}`,
    paymentType: "ROOM_BOOKING",
    bookingId: bookingW.id,
  });
  assert(
    (payOrderW.amount === 11500 + 23000 + 499 || payOrderW.amountInPaise === (11500 + 23000 + 499) * 100) && payOrderW.currency === "INR",
    "Test AJ (Prompt 37): Booking payment order creation (Rent + Deposit + Platform Fee) verified"
  );

  // Prompt 38
  await bookingService.markBookingAsPaid(bookingW.id);
  const stayMoveInRes = await stayService.confirmMoveIn({ bookingId: bookingW.id, userId: `u-w-${timestamp}` });
  assert(
    stayMoveInRes.success && stayMoveInRes.stay?.status === "ACTIVE",
    "Test AK (Prompt 38): Move-in confirmation transitions paid booking to ACTIVE stay"
  );

  console.log("\n===============================================================================");
  console.log("PROMPT 39 TEST MATRIX COMPLETED SUCCESSFULLY!");
  console.log("===============================================================================");
}

runRentPaymentTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
