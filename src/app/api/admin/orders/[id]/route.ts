import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Order from "@/models/Order";
import { getAdminSession } from "@/lib/auth/session";
import { updateOrderStatusSchema } from "@/lib/validation/order";
import { isValidStatusTransition } from "@/lib/constants/order";
import { broadcastOrderStatusChange } from "@/lib/realtime";
import mongoose from "mongoose";
import { ApiResponse } from "@/types/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Admin session required." } },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectToDatabase();

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).lean();
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: id }).lean();
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: { message: "Order not found" } },
        { status: 404 }
      );
    }

    const formattedOrder = {
      ...order,
      _id: order._id.toString(),
      createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: formattedOrder,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/admin/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to retrieve order." } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Admin session required." } },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectToDatabase();

    const body = await request.json();
    const parseResult = updateOrderStatusSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Invalid status update data provided." },
        },
        { status: 400 }
      );
    }

    const { orderStatus, paymentStatus } = parseResult.data;

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: id });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: { message: "Order not found" } },
        { status: 404 }
      );
    }

    // Validate status transition
    if (!isValidStatusTransition(order.orderStatus, orderStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Cannot transition status backwards from "${order.orderStatus}" to "${orderStatus}".`,
          },
        },
        { status: 400 }
      );
    }

    order.orderStatus = orderStatus;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    } else if (orderStatus === "Completed" && order.paymentMethod === "Cash on Delivery") {
      order.paymentStatus = "Paid";
    }

    await order.save();

    // Trigger realtime broadcast (falls back to polling cleanly)
    await broadcastOrderStatusChange(order.orderNumber, orderStatus);

    const formattedOrder = {
      ...order.toObject(),
      _id: order._id.toString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: formattedOrder,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update order status." } },
      { status: 500 }
    );
  }
}
