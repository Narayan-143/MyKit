import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Order from "@/models/Order";
import { getAdminSession } from "@/lib/auth/session";
import { ApiResponse } from "@/types/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Admin session required." } },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const [
      totalOrders,
      pendingOrders,
      acceptedOrders,
      preparingOrders,
      completedOrders,
      revenueResult,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: "Pending" }),
      Order.countDocuments({ orderStatus: "Accepted" }),
      Order.countDocuments({ orderStatus: "Preparing" }),
      Order.countDocuments({ orderStatus: "Completed" }),
      Order.aggregate([
        { $match: { paymentStatus: "Paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    const formattedRecentOrders = recentOrders.map((o) => ({
      ...o,
      _id: o._id.toString(),
      createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: o.updatedAt ? new Date(o.updatedAt).toISOString() : new Date().toISOString(),
    }));

    const response: ApiResponse = {
      success: true,
      data: {
        stats: {
          totalOrders,
          pendingOrders,
          acceptedOrders,
          preparingOrders,
          completedOrders,
          totalRevenue,
        },
        recentOrders: formattedRecentOrders,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to calculate admin statistics." } },
      { status: 500 }
    );
  }
}
