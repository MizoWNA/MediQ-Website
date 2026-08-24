import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MEDIQ_DOMAIN = "@med.iq";

export async function POST(request: NextRequest) {
  try {
    // ------------------------------------------------------------
    // Authenticate the requesting user
    // ------------------------------------------------------------

    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const accessToken = authorization.replace("Bearer ", "");

    const {
      data: { user: requestingUser },
      error: authError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !requestingUser) {
      return NextResponse.json(
        { error: "Invalid authentication session." },
        { status: 401 }
      );
    }

    // ------------------------------------------------------------
    // Verify admin role
    // ------------------------------------------------------------

    const { data: requestingProfile, error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", requestingUser.id)
        .single();

    if (profileError || requestingProfile?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    // ------------------------------------------------------------
    // Read request body
    // ------------------------------------------------------------

    const body = await request.json();

    const {
      username,
      password,
      display_name,
      role,
      year,
      start_date,
      end_date,
      exam_date,
      mentor_id,
    } = body;

    // ------------------------------------------------------------
    // Basic validation
    // ------------------------------------------------------------

    if (!username || !password || !display_name || !role) {
      return NextResponse.json(
        {
          error:
            "Username, password, display name, and role are required.",
        },
        { status: 400 }
      );
    }

    if (!["student", "mentor", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role." },
        { status: 400 }
      );
    }

    const cleanUsername = username
      .trim()
      .toLowerCase();

    if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
      return NextResponse.json(
        {
          error:
            "Username may only contain letters, numbers, dots, underscores, and hyphens.",
        },
        { status: 400 }
      );
    }

    const email = `${cleanUsername}${MEDIQ_DOMAIN}`;

    // ------------------------------------------------------------
    // Create Supabase Auth user
    // ------------------------------------------------------------

    const {
      data: authData,
      error: createAuthError,
    } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createAuthError || !authData.user) {
      return NextResponse.json(
        {
          error:
            createAuthError?.message ||
            "Failed to create authentication user.",
        },
        { status: 400 }
      );
    }

    const newUserId = authData.user.id;

    // ------------------------------------------------------------
    // Create linked profile
    // ------------------------------------------------------------

    const { error: createProfileError } =
      await supabaseAdmin
        .from("profiles")
        .insert({
          id: newUserId,
          username: cleanUsername,
          display_name,
          role,
          year: year ?? null,
          start_date: start_date || null,
          end_date: end_date || null,
          exam_date: exam_date || null,
          mentor_id: mentor_id || null,
        });

    // ------------------------------------------------------------
    // Roll back Auth user if profile creation failed
    // ------------------------------------------------------------

    if (createProfileError) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId);

      return NextResponse.json(
        {
          error: `Profile creation failed: ${createProfileError.message}`,
        },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------
    // Success
    // ------------------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUserId,
          username: cleanUsername,
          email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin user creation failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}