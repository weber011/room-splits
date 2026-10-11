import crypto from "crypto";
import { propertyService } from "../src/services/property.service";
import { propertyUnlockService } from "../src/services/property-unlock.service";
import { paymentService } from "../src/services/payment.service";
import { razorpayWebhookService } from "../src/services/razorpay-webhook.service";
import { visitService } from "../src/services/visit.service";
import { PLATFORM_SETTINGS } from "../src/config/business-rules.config";

/**
 * PROMPT 35 — END-TO-END ₹9 PROPERTY UNLOCK JOURNEY TEST SUITE
 */
async function runEndToEndIntegrationPass() {
  console.log("==================================================");
  console.log("PROMPT 35: E2E ₹9 PROPERTY UNLOCK INTEGRATION PASS");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${detail ? `- ${detail}` : ""}`);
      failed++;
    }
  }

  const testStudentId = "u-101"; // Aligned with session resolver fallback
  const testStudentB = "u-e2e-student-888";
  const testPropertyId = "prop-3"; // Greenwood Residency Jamshedpur
  const testWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "RoomSplitsWebhookSecret2026";

  function generateSignedWebhook(payloadObj: object, eventId?: string) {
    const rawBody = JSON.stringify({
      event_id: eventId || `evt_e2e_${Date.now()}_${Math.random()}`,
      ...payloadObj,
    });
    const signature = crypto
      .createHmac("sha256", testWebhookSecret)
      .update(rawBody)
      .digest("hex");
    return { rawBody, signature };
  }

  // STEP 1: PUBLIC DISCOVERY & LOCKED DATA AUDIT (Logged-out & Locked Student)
  try {
    const publicPropLoggedOut = await propertyService.getPropertyById(testPropertyId);
    const publicPropStudent = await propertyService.getPropertyById(testPropertyId, testStudentId, "tenant");

    const isAddressMasked = Boolean(publicPropLoggedOut?.location.address.includes("🔒 Exact Location & Contact Details Locked"));
    const isLatUndefined = publicPropLoggedOut?.location.latitude === undefined;
    const isLngUndefined = publicPropLoggedOut?.location.longitude === undefined;
    const isOwnerContactHidden = publicPropLoggedOut?.ownerContact === undefined;
    const isUnlockedFalse = publicPropLoggedOut?.isUnlocked === false && publicPropStudent?.isUnlocked === false;

    assert(
      isAddressMasked && isLatUndefined && isLngUndefined && isOwnerContactHidden && isUnlockedFalse,
      "STEP 1: Locked property audit — exact address, lat/lng, owner contact & visit instructions are 100% hidden server-side"
    );
  } catch (err: unknown) {
    assert(false, "STEP 1: Locked property audit", String(err));
  }

  // STEP 2: VISIT PREREQUISITE CHECK (Attempting visit BEFORE unlock)
  try {
    let visitBlocked = false;
    try {
      await visitService.createVisitRequest({
        propertyId: testPropertyId,
        preferredDate: "2026-10-25",
        preferredTime: "Evening (05:00 PM - 07:00 PM)",
        studentMessage: "Pre-unlock visit request attempt",
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message.toLowerCase().includes("unlock this property for ₹9")) {
        visitBlocked = true;
      }
    }

    assert(
      visitBlocked === true,
      "STEP 2: Visit request blocked server-side when property is locked"
    );
  } catch (err: unknown) {
    assert(false, "STEP 2: Visit prerequisite check", String(err));
  }

  // STEP 3: SERVER-SIDE ₹9 ORDER CREATION
  let e2eOrderId = `order_e2e_${Date.now()}`;
  let internalPaymentId = "";
  try {
    const orderConfig = await paymentService.createRazorpayOrder({
      userId: testStudentId,
      paymentType: "PROPERTY_UNLOCK",
      relatedPropertyId: testPropertyId,
    });

    internalPaymentId = orderConfig.paymentId;
    e2eOrderId = orderConfig.razorpayOrderId;

    assert(
      orderConfig.amount === PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE &&
        orderConfig.amountInPaise === 900 &&
        orderConfig.currency === "INR" &&
        Boolean(orderConfig.razorpayKeyId),
      "STEP 3: Server-side Razorpay order created for ₹9 (900 paise, INR)"
    );
  } catch (err: unknown) {
    assert(false, "STEP 3: Order creation", String(err));
  }

  // STEP 4: RAZORPAY WEBHOOK RECONCILIATION & UNLOCK ACTIVATION
  try {
    const webhookPayload = generateSignedWebhook({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: `pay_e2e_${Date.now()}`,
            order_id: e2eOrderId,
            amount: 900,
            currency: "INR",
          },
        },
      },
    });

    const webhookRes = await razorpayWebhookService.processWebhook(webhookPayload.rawBody, webhookPayload.signature);
    const updatedPayment = await paymentService.getPaymentById(internalPaymentId);
    const isUnlockedNow = await propertyUnlockService.hasUserUnlockedProperty(testStudentId, testPropertyId);

    assert(
      webhookRes.success && updatedPayment?.status === "CAPTURED" && isUnlockedNow === true,
      "STEP 4: Webhook reconciles payment to CAPTURED and activates property unlock"
    );
  } catch (err: unknown) {
    assert(false, "STEP 4: Webhook reconciliation", String(err));
  }

  // STEP 5: UNLOCKED PROPERTY DATA AUDIT
  try {
    const unlockedProp = await propertyService.getPropertyById(testPropertyId, testStudentId, "tenant");

    const isUnlockedTrue = unlockedProp?.isUnlocked === true;
    const hasExactAddress = Boolean(unlockedProp?.location.address.includes("Bistupur") || unlockedProp?.location.address.includes("Inner Circle"));
    const hasLat = typeof unlockedProp?.location.latitude === "number";
    const hasLng = typeof unlockedProp?.location.longitude === "number";
    const hasOwnerPhone = Boolean(unlockedProp?.ownerContact?.phone);
    const hasVisitInstructions = Boolean(unlockedProp?.ownerContact?.visitInstructions);

    assert(
      isUnlockedTrue && hasExactAddress && hasLat && hasLng && hasOwnerPhone && hasVisitInstructions,
      "STEP 5: Unlocked property audit — exact address, GPS lat/lng, owner contact & visit instructions are visible"
    );
  } catch (err: unknown) {
    assert(false, "STEP 5: Unlocked property audit", String(err));
  }

  // STEP 6: VISIT REQUEST POST-UNLOCK
  try {
    const visitResult = await visitService.createVisitRequest({
      propertyId: testPropertyId,
      preferredDate: "2026-10-25",
      preferredTime: "Evening (05:00 PM - 07:00 PM)",
      studentMessage: "Post-unlock visit request attempt",
    });

    assert(
      Boolean(visitResult.id) && visitResult.passCode.startsWith("VP-2026-"),
      "STEP 6: Visit request created successfully after ₹9 unlock"
    );
  } catch (err: unknown) {
    assert(false, "STEP 6: Post-unlock visit request", String(err));
  }

  // STEP 7: AUTHORIZATION MATRIX AUDIT
  try {
    // A. Student B accessing Property 3 (Unlocked by Student A)
    const prop3ForStudentB = await propertyService.getPropertyById(testPropertyId, testStudentB, "tenant");
    // B. Property Owner accessing their own property
    const prop3ForOwner3 = await propertyService.getPropertyById(testPropertyId, "owner-3", "owner", "owner-3");
    // C. Admin accessing Property 3
    const prop3ForAdmin = await propertyService.getPropertyById(testPropertyId, "admin-user-1", "admin");

    const test7Passed =
      prop3ForStudentB?.isUnlocked === false &&
      prop3ForOwner3?.isUnlocked === true &&
      prop3ForAdmin?.isUnlocked === true;

    assert(
      test7Passed,
      "STEP 7: Authorization Matrix — Access controls strictly scoped per user/property role boundaries"
    );
  } catch (err: unknown) {
    assert(false, "STEP 7: Authorization Matrix", String(err));
  }

  // STEP 8: REPEATED UNLOCK IDEMPOTENCY CHECK
  try {
    let duplicateOrderBlocked = false;
    try {
      await paymentService.createRazorpayOrder({
        userId: testStudentId,
        paymentType: "PROPERTY_UNLOCK",
        relatedPropertyId: testPropertyId,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("already holds an active access pass")) {
        duplicateOrderBlocked = true;
      }
    }

    assert(
      duplicateOrderBlocked === true,
      "STEP 8: Duplicate order creation blocked for already unlocked property"
    );
  } catch (err: unknown) {
    assert(false, "STEP 8: Duplicate unlock idempotency", String(err));
  }

  console.log("\n==================================================");
  console.log(`E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runEndToEndIntegrationPass().catch((err) => {
  console.error("E2E Pass Fatal Error:", err);
  process.exit(1);
});
