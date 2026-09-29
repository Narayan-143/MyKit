import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Order from "@/models/Order";
import { ApiResponse } from "@/types/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    await connectToDatabase();

    const order = await Order.findOne({ orderNumber }).lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Order not found" },
        },
        { status: 404 }
      );
    }

    // Customer-safe representation
    const customerSafeData = {
      orderNumber: order.orderNumber,
      customer: {
        name: order.customer.name,
        address: order.customer.address,
      },
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: customerSafeData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/orders/[orderNumber] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to retrieve order tracking information" },
      },
      { status: 500 }
    );
  }
}
