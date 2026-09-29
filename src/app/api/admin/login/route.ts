import { NextRequest, NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validation/admin";
import { verifyAdminCredentials, createAdminSession } from "@/lib/auth/session";
import { ApiResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parseResult = adminLoginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Invalid email or password format." },
        },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;

    const isValid = verifyAdminCredentials(email, password);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Invalid email or password. Please try again." },
        },
        { status: 401 }
      );
    }

    // Set secure HTTP-only cookie
    await createAdminSession(email);

    const response: ApiResponse = {
      success: true,
      data: {
        email,
        role: "admin",
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("POST /api/admin/login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "An error occurred during login. Please try again." },
      },
      { status: 500 }
    );
  }
}
