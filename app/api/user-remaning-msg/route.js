import { aj } from "@/config/Arcjet";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const user = await currentUser();
    const { token } = await req.json();

    // Check for missing or invalid token
    if (token === undefined || token === null) {
      return NextResponse.json({ 
        success: false,
        message: "Missing token in request body." 
      }, { status: 400 });
    }

    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
      return NextResponse.json({ 
        success: false,
        message: "User not authenticated." 
      }, { status: 401 });
    }

    // First protection check
    const decision = await aj.protect(req, {
      userId: email,
      requested: token,
    });

    if (decision.isDenied()) {
      return NextResponse.json({
        allowed: false,
        remainingToken: decision.reason?.remaining ?? 0,
      });
    }

    // If allowed, fetch remaining token count
    const remainingCheck = await aj.protect(req, {
      userId: email,
      requested: 0,
    });

    return NextResponse.json({
      allowed: true,
      remainingToken: remainingCheck.reason?.remaining ?? 0,
    });

  } catch (error) {
    console.error("API /user-remaning-msg error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    }, { status: 500 });
  }
}
