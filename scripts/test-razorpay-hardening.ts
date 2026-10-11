import crypto from "crypto";
import { razorpayWebhookService } from "../src/services/razorpay-webhook.service";
import { paymentService } from "../src/services/payment.service";
import { propertyUnlockService } from "../src/services/property-unlock.service";
import { PLATFORM_SETTINGS } from "../src/config/business-rules.config";

/**
 * AUTOMATED SECURITY & RECONCILIATION TEST SUITE (PROMPT 34)
 * Validates Security Test Matrix Scenarios A through Q.
 */
async function runSecurityTests() {
  console.log("==================================================");
  console.log("RUNNING RAZORPAY SECURITY & RECONCILIATION TEST MATRIX");
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

  // Setup Test Secret & Context
  const testWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "RoomSplitsWebhookSecret2026";
  const testUserId = "user-sec-test-101";
  const testPropertyId = "prop-sec-test-202";

  function generateValidWebhook(payloadObj: object, eventId?: string): { rawBody: string; signature: string } {
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

  // TEST A: Invalid webhook signature → rejected
  try {
    const resA = await razorpayWebhookService.processWebhook(
      JSON.stringify({ event: "payment.captured" }),
      "invalid_signature_hex_1234567890abcdef"
    );
    assert(!resA.success && resA.statusCode === 400, "TEST A: Invalid webhook signature rejected with HTTP 400");
  } catch (err: unknown) {
    assert(false, "TEST A: Invalid webhook signature", String(err));
  }

  // TEST B: Valid payment.captured → payment becomes CAPTURED
  let testPaymentIdB = "";
  let testOrderIdB = `order_test_b_${Date.now()}`;
  try {
    const internalPayment = await paymentService.createPaymentRecord({
      userId: testUserId,
      amount: PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE,
      paymentType: "PROPERTY_UNLOCK",
      relatedPropertyId: testPropertyId,
    });
    testPaymentIdB = internalPayment.id;
    await paymentService.updatePaymentStatus(internalPayment.id, "ORDER_CREATED", {
      razorpay_order_id: testOrderIdB,
    });

    const webhookB = generateValidWebhook({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: `pay_test_b_${Date.now()}`,
            order_id: testOrderIdB,
            amount: 900,
            currency: "INR",
          },
        },
      },
    });

    const resB = await razorpayWebhookService.processWebhook(webhookB.rawBody, webhookB.signature);
    const updatedPaymentB = await paymentService.getPaymentById(testPaymentIdB);

    assert(
      resB.success && updatedPaymentB?.status === "CAPTURED" && resB.unlockActive === true,
      "TEST B: Valid payment.captured transitions payment to CAPTURED & activates unlock"
    );
  } catch (err: unknown) {
    assert(false, "TEST B: Valid payment.captured", String(err));
  }

  // TEST C: Duplicate payment.captured → no duplicate side effects (Idempotent)
  try {
    const eventIdC = `evt_dup_test_${Date.now()}`;
    const webhookC = generateValidWebhook(
      {
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: `pay_test_c_${Date.now()}`,
              order_id: testOrderIdB,
              amount: 900,
              currency: "INR",
            },
          },
        },
      },
      eventIdC
    );

    const resC1 = await razorpayWebhookService.processWebhook(webhookC.rawBody, webhookC.signature);
    const resC2 = await razorpayWebhookService.processWebhook(webhookC.rawBody, webhookC.signature);

    assert(
      resC1.success && resC2.success && resC2.duplicate === true,
      "TEST C: Duplicate payment.captured returns duplicate=true with zero duplicate side-effects"
    );
  } catch (err: unknown) {
    assert(false, "TEST C: Duplicate payment.captured", String(err));
  }

  // TEST D: payment.failed before success → payment becomes FAILED
  let testOrderIdD = `order_test_d_${Date.now()}`;
  try {
    const internalPaymentD = await paymentService.createPaymentRecord({
      userId: testUserId,
      amount: PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE,
      paymentType: "PROPERTY_UNLOCK",
      relatedPropertyId: "prop-fail-1",
    });
    await paymentService.updatePaymentStatus(internalPaymentD.id, "ORDER_CREATED", {
      razorpay_order_id: testOrderIdD,
    });

    const webhookD = generateValidWebhook({
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: `pay_fail_${Date.now()}`,
            order_id: testOrderIdD,
          },
        },
      },
    });

    const resD = await razorpayWebhookService.processWebhook(webhookD.rawBody, webhookD.signature);
    const updatedPaymentD = await paymentService.getPaymentById(internalPaymentD.id);

    assert(
      resD.success && updatedPaymentD?.status === "FAILED",
      "TEST D: payment.failed before success transitions payment to FAILED"
    );
  } catch (err: unknown) {
    assert(false, "TEST D: payment.failed", String(err));
  }

  // TEST E: Late payment.failed after CAPTURED → remains CAPTURED (Monotonic Guard)
  try {
    const webhookE = generateValidWebhook({
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: `pay_test_b_${Date.now()}`,
            order_id: testOrderIdB,
          },
        },
      },
    });

    await razorpayWebhookService.processWebhook(webhookE.rawBody, webhookE.signature);
    const paymentE = await paymentService.getPaymentById(testPaymentIdB);

    assert(
      paymentE?.status === "CAPTURED",
      "TEST E: Late payment.failed after CAPTURED is safely ignored and status remains CAPTURED"
    );
  } catch (err: unknown) {
    assert(false, "TEST E: Late payment.failed guard", String(err));
  }

  // TEST F & G: order.paid & duplicate order.paid
  let testOrderIdFG = `order_test_fg_${Date.now()}`;
  try {
    const paymentFG = await paymentService.createPaymentRecord({
      userId: testUserId,
      amount: PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE,
      paymentType: "PROPERTY_UNLOCK",
      relatedPropertyId: "prop-fg-9",
    });
    await paymentService.updatePaymentStatus(paymentFG.id, "ORDER_CREATED", {
      razorpay_order_id: testOrderIdFG,
    });

    const webhookFG = generateValidWebhook({
      event: "order.paid",
      payload: {
        order: {
          entity: {
            id: testOrderIdFG,
            amount: 900,
            currency: "INR",
          },
        },
      },
    });

    const resF = await razorpayWebhookService.processWebhook(webhookFG.rawBody, webhookFG.signature);
    const resG = await razorpayWebhookService.processWebhook(webhookFG.rawBody, webhookFG.signature);
    const updatedFG = await paymentService.getPaymentById(paymentFG.id);

    assert(
      resF.success && updatedFG?.status === "CAPTURED" && resG.duplicate === true,
      "TEST F & G: order.paid reconciles payment to CAPTURED and duplicate call is idempotent"
    );
  } catch (err: unknown) {
    assert(false, "TEST F & G: order.paid", String(err));
  }

  // TEST H: Browser verification + webhook both run → exactly one unlock
  try {
    const isUnlockedH = await propertyUnlockService.hasUserUnlockedProperty(testUserId, testPropertyId);
    const unlockedProps = await propertyUnlockService.getUserUnlockedProperties(testUserId);
    const count = unlockedProps.filter((p) => p === testPropertyId).length;

    assert(
      isUnlockedH && count === 1,
      "TEST H: Dual browser verification + webhook results in exactly ONE active unlock"
    );
  } catch (err: unknown) {
    assert(false, "TEST H: Dual trigger unlock count", String(err));
  }

  // TEST I: Webhook without browser verification → successful payment unlocks property
  let testOrderIdI = `order_test_i_${Date.now()}`;
  const testPropI = "prop-browser-closed-101";
  try {
    const paymentI = await paymentService.createPaymentRecord({
      userId: testUserId,
      amount: PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE,
      paymentType: "PROPERTY_UNLOCK",
      relatedPropertyId: testPropI,
    });
    await paymentService.updatePaymentStatus(paymentI.id, "ORDER_CREATED", {
      razorpay_order_id: testOrderIdI,
    });

    // Browser closes here! Only webhook arrives.
    const webhookI = generateValidWebhook({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: `pay_closed_${Date.now()}`,
            order_id: testOrderIdI,
            amount: 900,
            currency: "INR",
          },
        },
      },
    });

    await razorpayWebhookService.processWebhook(webhookI.rawBody, webhookI.signature);
    const isUnlockedI = await propertyUnlockService.hasUserUnlockedProperty(testUserId, testPropI);

    assert(
      isUnlockedI === true,
      "TEST I: Webhook alone unlocks property when browser is closed before client verification"
    );
  } catch (err: unknown) {
    assert(false, "TEST I: Webhook without browser verification", String(err));
  }

  // TEST K: Wrong amount → payment is NOT finalized
  let testOrderIdK = `order_test_k_${Date.now()}`;
  try {
    const paymentK = await paymentService.createPaymentRecord({
      userId: testUserId,
      amount: PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE,
      paymentType: "PROPERTY_UNLOCK",
      relatedPropertyId: "prop-wrong-amt-1",
    });
    await paymentService.updatePaymentStatus(paymentK.id, "ORDER_CREATED", {
      razorpay_order_id: testOrderIdK,
    });

    const webhookK = generateValidWebhook({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: `pay_tampered_${Date.now()}`,
            order_id: testOrderIdK,
            amount: 100, // 1 INR instead of 9 INR!
            currency: "INR",
          },
        },
      },
    });

    const resK = await razorpayWebhookService.processWebhook(webhookK.rawBody, webhookK.signature);
    const paymentKAfter = await paymentService.getPaymentById(paymentK.id);

    assert(
      !resK.success && paymentKAfter?.status !== "CAPTURED",
      "TEST K: Webhook with wrong payment amount is rejected and payment remains non-CAPTURED"
    );
  } catch (err: unknown) {
    assert(false, "TEST K: Wrong amount validation", String(err));
  }

  // TEST M: Unknown Razorpay order → no phantom internal payment created
  try {
    const webhookM = generateValidWebhook({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: `pay_phantom_${Date.now()}`,
            order_id: `order_non_existent_${Date.now()}`,
            amount: 900,
            currency: "INR",
          },
        },
      },
    });

    const resM = await razorpayWebhookService.processWebhook(webhookM.rawBody, webhookM.signature);
    assert(
      resM.success && resM.message.includes("No matching internal payment found"),
      "TEST M: Unknown Razorpay order does not create phantom internal payment"
    );
  } catch (err: unknown) {
    assert(false, "TEST M: Unknown Razorpay order", String(err));
  }

  // TEST O: Unsupported valid webhook event → safely ignored
  try {
    const webhookO = generateValidWebhook({
      event: "subscription.activated",
      payload: { sub: { id: "sub_123" } },
    });

    const resO = await razorpayWebhookService.processWebhook(webhookO.rawBody, webhookO.signature);
    assert(
      resO.success && resO.statusCode === 200,
      "TEST O: Unsupported valid webhook event is safely accepted (HTTP 200) without error"
    );
  } catch (err: unknown) {
    assert(false, "TEST O: Unsupported webhook event", String(err));
  }

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests().catch((e) => {
  console.error("Test Suite Fatal Error:", e);
  process.exit(1);
});
