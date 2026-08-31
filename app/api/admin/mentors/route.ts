import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/*
 * ================================================================
 * ADMIN AUTHENTICATION
 * ================================================================
 */

async function authenticateAdmin(request: NextRequest) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  const accessToken =
    authorization.replace("Bearer ", "");

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(
    accessToken
  );

  if (authError || !user) {
    return {
      error: NextResponse.json(
        {
          error:
            "Invalid authentication session.",
        },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } =
    await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (
    profileError ||
    profile?.role !== "admin"
  ) {
    return {
      error: NextResponse.json(
        {
          error:
            "Admin access required.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    error: null,
  };
}

/*
 * ================================================================
 * GET — LIST MENTORS
 * ================================================================
 */

export async function GET(
  request: NextRequest
) {
  try {
    const { error } =
      await authenticateAdmin(request);

    if (error) {
      return error;
    }

    const {
      data: mentors,
      error: mentorsError,
    } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, username, display_name"
      )
      .eq("role", "mentor")
      .order("display_name", {
        ascending: true,
      });

    if (mentorsError) {
      console.error(
        "Failed to fetch mentors:",
        mentorsError.message
      );

      return NextResponse.json(
        {
          error:
            "Failed to load mentors.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      mentors: mentors ?? [],
    });
  } catch (error) {
    console.error(
      "Admin mentor listing failed:",
      error
    );

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