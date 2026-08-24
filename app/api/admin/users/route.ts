import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MEDIQ_DOMAIN = "@med.iq";

/*
 * ================================================================
 * ADMIN AUTHENTICATION
 * ================================================================
 */

async function authenticateAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  const accessToken = authorization.replace("Bearer ", "");

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Invalid authentication session." },
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

  if (profileError || profile?.role !== "admin") {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      ),
    };
  }

  return {
    user,
    error: null,
  };
}

/*
 * ================================================================
 * GET — LIST USERS
 * ================================================================
 */

export async function GET(request: NextRequest) {
  try {
    const { error } = await authenticateAdmin(request);

    if (error) {
      return error;
    }

    const { data: users, error: usersError } =
      await supabaseAdmin
        .from("profiles")
        .select(`
          id,
          username,
          display_name,
          role,
          year,
          start_date,
          end_date,
          exam_date,
          mentor_id
        `)
        .in("role", ["student", "mentor"])
        .order("display_name", {
          ascending: true,
          nullsFirst: false,
        });

    if (usersError) {
      console.error(
        "Failed to fetch admin users:",
        usersError.message
      );

      return NextResponse.json(
        { error: "Failed to load users." },
        { status: 500 }
      );
    }

    /*
     * ------------------------------------------------------------
     * Fetch mentor names
     * ------------------------------------------------------------
     *
     * We intentionally do this as a second query instead of
     * relying on a foreign-key relationship being configured
     * correctly in Supabase.
     */

    const mentorIds = [
      ...new Set(
        (users ?? [])
          .map((user) => user.mentor_id)
          .filter(Boolean)
      ),
    ];

    let mentors: {
      id: string;
      username: string | null;
      display_name: string | null;
    }[] = [];

    if (mentorIds.length > 0) {
      const { data: mentorData, error: mentorError } =
        await supabaseAdmin
          .from("profiles")
          .select("id, username, display_name")
          .in("id", mentorIds)
          .eq("role", "mentor");

      if (mentorError) {
        console.error(
          "Failed to fetch mentor information:",
          mentorError.message
        );
      } else {
        mentors = mentorData ?? [];
      }
    }

    const mentorMap = new Map(
      mentors.map((mentor) => [mentor.id, mentor])
    );

    const formattedUsers = (users ?? []).map((user) => {
      const mentor = user.mentor_id
        ? mentorMap.get(user.mentor_id) ?? null
        : null;

      return {
        ...user,
        mentor: mentor
          ? {
              id: mentor.id,
              username: mentor.username,
              display_name: mentor.display_name,
            }
          : null,
      };
    });

    return NextResponse.json({
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Admin user listing failed:", error);

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

/*
 * ================================================================
 * POST — CREATE USER
 * ================================================================
 */

export async function POST(request: NextRequest) {
  try {
    // ------------------------------------------------------------
    // Authenticate the requesting user
    // ------------------------------------------------------------

    const { error } = await authenticateAdmin(request);

    if (error) {
      return error;
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

    if (!["student", "mentor"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

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