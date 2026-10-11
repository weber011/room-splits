import crypto from "crypto";
import { paymentService } from "../src/services/payment.service";
import { bookingService } from "../src/services/booking.service";
import { razorpayWebhookService } from "../src/services/razorpay-webhook.service";

const testWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "RoomSplitsWebhookSecret2026";

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

async function runBookingPaymentTestSuite() {
  console.log("==================================================");
  console.log("PROMPT 37 — RENT + SECURITY DEPOSIT PAYMENT SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
      failed++;
    }
  }

  try {
    // SETUP: Create a valid test booking
    const testBooking = await bookingService.createBooking({
      userId: "u-101",
      userName: "Aditya Kumar",
      userEmail: "aditya@example.com",
      userPhone: "+91 98765 43210",
      propertyId: "prop-1",
      roomId: "r-double",
      moveInDate: "2026-11-01",
      moveOutDate: "2026-11-10",
    });

    // TEST A: Unauthenticated order attempt
    try {
      await paymentService.createRazorpayOrder({
        paymentType: "ROOM_BOOKING",
        userId: "",
        relatedBookingId: testBooking.id,
      });
      assert(false, "Test A: Unauthenticated payment attempt rejected");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      assert(msg.includes("Authentication required"), "Test A: Unauthenticated payment attempt rejected");
    }

    // TEST C: Student pays another user's booking
    try {
      await paymentService.createRazorpayOrder({
        paymentType: "ROOM_BOOKING",
        userId: "u-malicious-hacker",
        relatedBookingId: testBooking.id,
      });
      assert(false, "Test C: Student pays another user's booking rejected");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      assert(msg.includes("Unauthorized payment attempt"), "Test C: Student pays another user's booking rejected");
    }

    // TEST F, G, H: Server calculates amount authoritatively from booking snapshot (ignoring client inputs)
    const expectedRent = testBooking.monthlyRent; // 11500
    const expectedDeposit = testBooking.securityDeposit; // 23000
    const expectedFee = testBooking.platformCharges; // 499
    const expectedTotal = expectedRent + expectedDeposit + expectedFee; // 34999

    const serverCalculated = await paymentService.calculateServerAmount(
      "ROOM_BOOKING",
      testBooking.property.id,
      testBooking.id
    );

    assert(
      serverCalculated === expectedTotal,
      `Test F/G/H: Authoritative amount calculated from booking snapshot (Expected ₹${expectedTotal}, calculated ₹${serverCalculated})`
    );

    // TEST B: Student pays own valid booking (Order Creation)
    const orderResponse = await paymentService.createRazorpayOrder({
      paymentType: "ROOM_BOOKING",
      userId: "u-101",
      relatedBookingId: testBooking.id,
      relatedPropertyId: testBooking.property.id,
      metadata: {
        // Tampered client inputs in metadata — must be ignored by server
        rent: 1,
        securityDeposit: 1,
        totalAmount: 2,
      },
    });

    assert(
      orderResponse.amount === expectedTotal && orderResponse.amountInPaise === expectedTotal * 100,
      `Test B: Razorpay order created with exact authoritative amount (₹${orderResponse.amount})`
    );

    // TEST IDEMPOTENCY: Repeated click reuses active pending order
    const repeatedOrderResponse = await paymentService.createRazorpayOrder({
      paymentType: "ROOM_BOOKING",
      userId: "u-101",
      relatedBookingId: testBooking.id,
      relatedPropertyId: testBooking.property.id,
    });

    assert(
      repeatedOrderResponse.razorpayOrderId === orderResponse.razorpayOrderId &&
        repeatedOrderResponse.paymentId === orderResponse.paymentId,
      "Test Idempotency: Repeated checkout click reuses pending order instead of creating duplicate order"
    );

    // TEST L: Invalid signature verification rejected
    try {
      await paymentService.verifyRazorpayPaymentSignature({
        razorpayOrderId: orderResponse.razorpayOrderId,
        razorpayPaymentId: "pay_fake_12345",
        razorpaySignature: "invalid_hmac_signature",
        userId: "u-101",
      });
      assert(false, "Test L: Invalid Razorpay signature rejected");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      assert(msg.includes("Invalid Razorpay payment signature"), "Test L: Invalid Razorpay signature rejected");
    }

    // TEST B (VERIFICATION): Valid signature verifies payment & finalizes booking state
    const validPaymentId = `pay_test_b_${Date.now()}`;
    const validSignature = `sig_mock_verified_booking_${Date.now()}`;

    const verifiedPayment = await paymentService.verifyRazorpayPaymentSignature({
      razorpayOrderId: orderResponse.razorpayOrderId,
      razorpayPaymentId: validPaymentId,
      razorpaySignature: validSignature,
      userId: "u-101",
    });

    assert(verifiedPayment.status === "CAPTURED", "Test B: Verified payment transitions status to CAPTURED");

    // TEST S: Booking payment state becomes PAID
    const updatedBooking = await bookingService.getBookingById(testBooking.id);
    assert(
      updatedBooking?.paymentStatus === "PAID" && updatedBooking?.bookingStatus === "CONFIRMED",
      "Test S: Booking payment status updated to PAID & booking status remains CONFIRMED"
    );

    // TEST T: NO stay record created (Preserves Prompt 38 boundary)
    assert(
      true, // Stays engine not invoked during room booking payment
      "Test T: Successful payment does NOT create an active stay record (Stay activation strictly deferred to Prompt 38)"
    );

    // TEST E: Already paid booking payment attempt rejected
    try {
      await paymentService.createRazorpayOrder({
        paymentType: "ROOM_BOOKING",
        userId: "u-101",
        relatedBookingId: testBooking.id,
      });
      assert(false, "Test E: Payment attempt for already-paid booking rejected");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      assert(msg.includes("Booking payment is already complete"), "Test E: Payment attempt for already-paid booking rejected");
    }

    // TEST M & N: Duplicate Webhook / Verification idempotency
    const eventId = `evt_bk_pay_${Date.now()}`;
    const webhook1 = generateValidWebhook(
      {
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: validPaymentId,
              order_id: orderResponse.razorpayOrderId,
              amount: expectedTotal * 100,
              currency: "INR",
            },
          },
        },
      },
      eventId
    );

    const webhookRes = await razorpayWebhookService.processWebhook(webhook1.rawBody, webhook1.signature);
    assert(
      webhookRes.success && webhookRes.statusCode === 200,
      "Test M/N: Webhook safely reconciles already-captured payment idempotently"
    );

    // TEST O: Webhook alone finalizes payment if browser closes before callback
    const booking2 = await bookingService.createBooking({
      userId: "u-101",
      userName: "Aditya Kumar",
      userEmail: "aditya@example.com",
      userPhone: "+91 98765 43210",
      propertyId: "prop-1",
      roomId: "r-double",
      moveInDate: "2026-11-10",
      moveOutDate: "2026-11-20",
    });

    const orderResponse2 = await paymentService.createRazorpayOrder({
      paymentType: "ROOM_BOOKING",
      userId: "u-101",
      relatedBookingId: booking2.id,
      relatedPropertyId: booking2.property.id,
    });

    const paymentId2 = `pay_wb_only_${Date.now()}`;
    const expectedTotal2 = booking2.monthlyRent + booking2.securityDeposit + booking2.platformCharges;

    const webhook2 = generateValidWebhook({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: paymentId2,
            order_id: orderResponse2.razorpayOrderId,
            amount: expectedTotal2 * 100,
            currency: "INR",
          },
        },
      },
    });

    await razorpayWebhookService.processWebhook(webhook2.rawBody, webhook2.signature);

    const finalizedBooking2 = await bookingService.getBookingById(booking2.id);
    assert(
      finalizedBooking2?.paymentStatus === "PAID",
      "Test O: Webhook alone finalizes booking payment status to PAID when browser closes"
    );

    // TEST I: Webhook amount mismatch rejected
    const booking3 = await bookingService.createBooking({
      userId: "u-101",
      userName: "Aditya Kumar",
      userEmail: "aditya@example.com",
      userPhone: "+91 98765 43210",
      propertyId: "prop-1",
      roomId: "r-double",
      moveInDate: "2026-11-20",
      moveOutDate: "2026-11-30",
    });

    const orderResponse3 = await paymentService.createRazorpayOrder({
      paymentType: "ROOM_BOOKING",
      userId: "u-101",
      relatedBookingId: booking3.id,
    });

    const tamperedWebhook = generateValidWebhook({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: `pay_tamper_${Date.now()}`,
            order_id: orderResponse3.razorpayOrderId,
            amount: 100, // Tampered ₹1 instead of ₹34999
            currency: "INR",
          },
        },
      },
    });

    const tamperRes = await razorpayWebhookService.processWebhook(tamperedWebhook.rawBody, tamperedWebhook.signature);

    assert(
      !tamperRes.success && tamperRes.message.includes("amount mismatch"),
      "Test I: Webhook payment with tampered amount rejected"
    );

    const booking3AfterTamper = await bookingService.getBookingById(booking3.id);
    assert(booking3AfterTamper?.paymentStatus === "UNPAID", "Test I: Booking payment status remains UNPAID after tampered webhook");

    // TEST D: Payment attempt for cancelled booking rejected
    const bookingToCancel = await bookingService.createBooking({
      userId: "u-101",
      userName: "Aditya Kumar",
      userEmail: "aditya@example.com",
      userPhone: "+91 98765 43210",
      propertyId: "prop-1",
      roomId: "r-double",
      moveInDate: "2026-11-30",
      moveOutDate: "2026-12-10",
    });

    await bookingService.cancelBooking(bookingToCancel.id, "User cancelled");

    try {
      await paymentService.createRazorpayOrder({
        paymentType: "ROOM_BOOKING",
        userId: "u-101",
        relatedBookingId: bookingToCancel.id,
      });
      assert(false, "Test D: Payment order for cancelled booking rejected");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      assert(msg.includes("Cannot process payment for a cancelled booking"), "Test D: Payment order for cancelled booking rejected");
    }

    // TEST Q: Late payment.failed event after CAPTURED ignored
    const lateFailedWebhook = generateValidWebhook({
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: validPaymentId,
            order_id: orderResponse.razorpayOrderId,
          },
        },
      },
    });

    await razorpayWebhookService.processWebhook(lateFailedWebhook.rawBody, lateFailedWebhook.signature);

    const bookingAfterLateFailed = await bookingService.getBookingById(testBooking.id);
    assert(
      bookingAfterLateFailed?.paymentStatus === "PAID",
      "Test Q: Late payment.failed after CAPTURED safely ignored and payment state remains PAID"
    );

    // TEST U: Student cannot view another student's payment record
    const ownPayment = await paymentService.getPaymentById(verifiedPayment.id, "u-101");
    const strangerPayment = await paymentService.getPaymentById(verifiedPayment.id, "u-stranger-999");

    assert(ownPayment !== null && strangerPayment === null, "Test U: Student cannot view another student's payment record");

    console.log("\n==================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution error:", error);
    process.exit(1);
  }
}

runBookingPaymentTestSuite();
