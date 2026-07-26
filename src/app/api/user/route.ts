import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { user } from "@/db/schema";

export async function GET(request: NextRequest) {
    try {
       const users = await db.select().from(user);

       return NextResponse.
       json({ 
        "message" : "user fetched successfully", 
        users: users }, 
        { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}