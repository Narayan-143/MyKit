import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import MenuItem from "@/models/MenuItem";
import { ApiResponse } from "@/types/api";
import { MenuResponse } from "@/types/menu";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const featured = searchParams.get("featured");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    // Construct MongoDB query filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (category && category !== "All") {
      filter.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (featured === "true") {
      filter.featured = true;
    }

    const total = await MenuItem.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;

    const items = await MenuItem.find(filter)
      .sort({ featured: -1, rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedItems = items.map((item) => ({
      ...item,
      _id: item._id.toString(),
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : undefined,
    }));

    const response: ApiResponse<MenuResponse> = {
      success: true,
      data: {
        items: formattedItems,
        total,
        page,
        totalPages,
        limit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/menu error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch menu items. Please try again later." },
      },
      { status: 500 }
    );
  }
}
