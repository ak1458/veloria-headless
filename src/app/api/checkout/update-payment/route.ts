import { NextRequest, NextResponse } from "next/server";
import { createShiprocketOrder } from "@/lib/shiprocket";

const WC_API_URL = process.env.WC_API_URL?.trim();
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY?.trim();
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET?.trim();

function getAuthHeader(): string {
  return "Basic " + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentId, status } = body;

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
        discount: 0,
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
