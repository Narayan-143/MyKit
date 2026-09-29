import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Order from "@/models/Order";
import { createOrderSchema } from "@/lib/validation/order";
import { calculateOrderTotals } from "@/lib/orders/calculator";
import { generateOrderNumber } from "@/lib/orders/orderNumber";
import { ApiResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();

    // 1. Validate request body schema
    const parseResult = createOrderSchema.safeParse(body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            message: issue?.message || "Invalid order details provided.",
            details: parseResult.error.flatten(),
          },
        },
        { status: 422 }
      );
    }

    const { customer, items, paymentMethod } = parseResult.data;

    // 2. Calculate totals on the server using trusted MongoDB prices
    // Never trust client subtotal, tax, or item prices
    let calculated;
    try {
      calculated = await calculateOrderTotals(items);
    } catch (calcError: unknown) {
      const msg = calcError instanceof Error ? calcError.message : "Error validating order items";
      return NextResponse.json(
        {
          success: false,
          error: { message: msg },
        },
        { status: 400 }
      );
    }

    // 3. Generate readable and unique order number
    const orderNumber = await generateOrderNumber();

    // 4. Set demo payment status
    const paymentStatus = paymentMethod === "Cash on Delivery" ? "Pending" : "Paid";

    // 5. Create and persist Order
    const newOrder = await Order.create({
      orderNumber,
      customer,
      items: calculated.verifiedItems,
      subtotal: calculated.subtotal,
      tax: calculated.tax,
      total: calculated.total,
      paymentMethod,
      paymentStatus,
      orderStatus: "Pending",
    });

    const response: ApiResponse = {
      success: true,
      data: {
        _id: newOrder._id.toString(),
        orderNumber: newOrder.orderNumber,
        customer: newOrder.customer,
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        tax: newOrder.tax,
        total: newOrder.total,
        paymentMethod: newOrder.paymentMethod,
        paymentStatus: newOrder.paymentStatus,
        orderStatus: newOrder.orderStatus,
        createdAt: newOrder.createdAt.toISOString(),
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to place order. Please try again." },
      },
      { status: 500 }
    );
  }
}
