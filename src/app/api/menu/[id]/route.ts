import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import MenuItem from "@/models/MenuItem";
import mongoose from "mongoose";
import { ApiResponse } from "@/types/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    let item = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      item = await MenuItem.findById(id).lean();
    }

    if (!item) {
      item = await MenuItem.findOne({ slug: id }).lean();
    }

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Menu item not found" },
        },
        { status: 404 }
      );
    }

    const formattedItem = {
      ...item,
      _id: item._id.toString(),
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : undefined,
    };

    const response: ApiResponse = {
      success: true,
      data: formattedItem,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/menu/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch menu item" },
      },
      { status: 500 }
    );
  }
}
