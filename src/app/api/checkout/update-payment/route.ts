import { NextRequest, NextResponse } from "next/server";
import { createShiprocketOrder } from "@/lib/shiprocket";
import crypto from "crypto";

const WC_API_URL = process.env.WC_API_URL?.trim();
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY?.trim();
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET?.trim();

function getAuthHeader(): string {
  return "Basic " + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentId, razorpayOrderId, razorpaySignature, status } = body;

    if (!orderId || !paymentId || !status) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (!WC_API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // ========================================
    // RAZORPAY SIGNATURE VERIFICATION (BUG-01 FIX)
    // Prevents attackers from marking orders as paid without actual payment
    // ========================================
    if (status === "completed") {
      const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

      if (!RAZORPAY_KEY_SECRET) {
        console.error("[UpdatePayment] Missing RAZORPAY_KEY_SECRET");
        return NextResponse.json(
          { error: "Server configuration error" },
          { status: 500 }
        );
      }

      if (!razorpayOrderId || !razorpaySignature) {
        console.warn("[UpdatePayment] Missing signature fields for completed payment");
        return NextResponse.json(
          { error: "Payment signature verification failed — missing fields" },
          { status: 400 }
        );
      }

      // Verify signature: HMAC SHA256 of "razorpayOrderId|paymentId" with secret
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${paymentId}`)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        console.error(`[UpdatePayment] Signature mismatch for order ${orderId}. Expected: ${expectedSignature}, Got: ${razorpaySignature}`);
        return NextResponse.json(
          { error: "Payment signature verification failed" },
          { status: 403 }
        );
      }

      console.log(`[UpdatePayment] Signature verified for order ${orderId}`);
    }

    // Update WooCommerce order with payment details
    const response = await fetch(`${WC_API_URL}/orders/${orderId}`, {
      method: "PUT",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: status === "completed" ? "processing" : "pending",
        meta_data: [
          {
            key: "_razorpay_payment_id",
            value: paymentId,
          },
          {
            key: "_payment_status",
            value: status,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("WooCommerce update error:", errorData);
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    const order = await response.json();

    // ========================================
    // SHIPROCKET SYNC (Prepaid orders sync after payment)
    // ========================================
    if (status === "completed" && order.status === "processing") {
      // Extract customer details from the WooCommerce order
      const billing = order.billing || {};
      const items = (order.line_items || []).map((item: { product_id: number; name: string; quantity: number; price: string; sku?: string }) => ({
        id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price) || 0,
        sku: item.sku,
      }));

      const subtotal = parseFloat(order.total || "0");
      const shippingTotal = (order.shipping_lines || []).reduce(
        (sum: number, line: { total: string }) => sum + parseFloat(line.total || "0"),
        0
      );

      // BUG-04 FIX: Calculate actual discount from order metadata
      const totalSavingsMeta = (order.meta_data || []).find(
        (m: { key: string; value: string }) => m.key === "_total_savings"
      );
      const actualDiscount = totalSavingsMeta ? parseFloat(totalSavingsMeta.value) || 0 : 0;

      // Fire-and-forget — don't block payment confirmation
      createShiprocketOrder({
        orderId: order.id,
        orderDate: new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().split(" ")[0],
        customer: {
          firstName: billing.first_name || "",
          lastName: billing.last_name || "",
          email: billing.email || "",
          phone: billing.phone || "",
          address: billing.address_1 || "",
          city: billing.city || "",
          state: billing.state || "",
          postalCode: billing.postcode || "",
        },
        items,
        paymentMethod: "prepaid",
        subtotal,
        shippingCharges: shippingTotal,
        discount: actualDiscount,
        total: subtotal,
      }).catch((err) => console.error("[UpdatePayment] Shiprocket sync failed (non-blocking):", err));
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: order.status,
    });
  } catch (error) {
    console.error("Update payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
