import { NextRequest, NextResponse } from "next/server";
import { initialErpState } from "@/lib/seed-data";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: initialErpState,
      message: "Shiv Furniture ERP initial state loaded",
    });
  } catch (error) {
    console.error("Error fetching ERP state:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
