import { NextRequest, NextResponse } from "next/server";
import { grantProAccess } from "@/lib/admin-utils";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userEmail, adminKey } = await req.json();

    // Simple admin key check (you should use a secure admin key)
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const { data: userData, error: userError } =
      await supabase.auth.admin.listUsers();

    if (userError) {
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    const user = userData.users.find((u) => u.email === userEmail);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Grant Pro access
    const success = await grantProAccess(user.id);

    if (success) {
      return NextResponse.json({
        message: `Pro access granted to ${userEmail}`,
        userId: user.id,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to grant Pro access" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Admin grant Pro error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check current subscription
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("email");
    const adminKey = searchParams.get("adminKey");

    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Find user and their subscription
    const { data: userData } = await supabase.auth.admin.listUsers();
    const user = userData.users.find((u) => u.email === userEmail);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get subscription info (you'd implement this)
    return NextResponse.json({
      userId: user.id,
      email: user.email,
      // Add subscription details here
    });
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
