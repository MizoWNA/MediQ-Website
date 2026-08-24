import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MEDIQ_DOMAIN = "@med.iq";

const DEFAULT_PAGE_SIZE = 8;
const MAX_PAGE_SIZE = 50;

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

    const searchParams = request.nextUrl.searchParams;

    const requestedPage = Number(
      searchParams.get("page") || "1"
    );

    const requestedPageSize = Number(
      searchParams.get("page_size") || DEFAULT_PAGE_SIZE
    );

    const page = Number.isInteger(requestedPage)
      ? Math.max(1, requestedPage)
      : 1;

    const pageSize = Number.isInteger(requestedPageSize)
      ? Math.min(
          MAX_PAGE_SIZE,
          Math.max(1, requestedPageSize)
        )
      : DEFAULT_PAGE_SIZE;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const rawSearch =
      searchParams.get("search")?.trim() || "";

    const search = rawSearch
      .replace(/[(),]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const role = searchParams.get("role");

    let query = supabaseAdmin
      .from("profiles")
      .select(
        `
          id,
          username,
          display_name,
          role,
          year,
          start_date,
          end_date,
          exam_date,
          mentor_id
        `,
        {
          count: "exact",
        }
      )
      .in("role", ["student", "mentor"]);

    if (role === "student" || role === "mentor") {
      query = query.eq("role", role);
    }

    if (search) {
      query = query.or(
        `display_name.ilike.%${search}%,username.ilike.%${search}%`
      );
    }

    query = query
      .order("display_name", {
        ascending: true,
        nullsFirst: false,
      })
      .range(from, to);

    const {
      data: users,
      error: usersError,
      count,
    } = await query;

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
     * Fetch mentors for the current page.
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
      total: count ?? 0,
      page,
      page_size: pageSize,
      total_pages: Math.max(
        1,
        Math.ceil((count ?? 0) / pageSize)
      ),
    });
  } catch (error) {
    console.error(
      "Admin user listing failed:",
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

/*
 * ================================================================
 * POST — CREATE USER
 * ================================================================
 */

export async function POST(request: NextRequest) {
  try {
    const { error } = await authenticateAdmin(request);

    if (error) {
      return error;
    }

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

    if (
      !username ||
      !password ||
      !display_name ||
      !role
    ) {
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

    const cleanUsername = username
      .trim()
      .toLowerCase();

    const cleanDisplayName = display_name.trim();

    if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
      return NextResponse.json(
        {
          error:
            "Username may only contain letters, numbers, dots, underscores, and hyphens.",
        },
        { status: 400 }
      );
    }

    if (!cleanDisplayName) {
      return NextResponse.json(
        { error: "Display name is required." },
        { status: 400 }
      );
    }

    if (
      role === "student" &&
      year !== null &&
      year !== undefined &&
      year !== ""
    ) {
      const numericYear = Number(year);

      if (
        !Number.isInteger(numericYear) ||
        numericYear < 1 ||
        numericYear > 5
      ) {
        return NextResponse.json(
          {
            error:
              "Academic year must be between 1 and 5.",
          },
          { status: 400 }
        );
      }
    }

    /*
     * Check username uniqueness.
     */

    const { data: usernameConflict } =
      await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("username", cleanUsername)
        .maybeSingle();

    if (usernameConflict) {
      return NextResponse.json(
        { error: "That username is already in use." },
        { status: 409 }
      );
    }

    const email =
      `${cleanUsername}${MEDIQ_DOMAIN}`;

    /*
     * Create Auth user.
     */

    const {
      data: authData,
      error: createAuthError,
    } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (
      createAuthError ||
      !authData.user
    ) {
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

    /*
     * Create profile.
     */

    const { error: createProfileError } =
      await supabaseAdmin
        .from("profiles")
        .insert({
          id: newUserId,
          username: cleanUsername,
          display_name: cleanDisplayName,
          role,
          year:
            role === "student"
              ? year ?? null
              : null,
          start_date:
            role === "student"
              ? start_date || null
              : null,
          end_date:
            role === "student"
              ? end_date || null
              : null,
          exam_date:
            role === "student"
              ? exam_date || null
              : null,
          mentor_id:
            role === "student"
              ? mentor_id || null
              : null,
        });

    /*
     * Roll back Auth user if profile creation failed.
     */

    if (createProfileError) {
      await supabaseAdmin.auth.admin.deleteUser(
        newUserId
      );

      return NextResponse.json(
        {
          error:
            `Profile creation failed: ${createProfileError.message}`,
        },
        { status: 400 }
      );
    }

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
    console.error(
      "Admin user creation failed:",
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

/*
 * ================================================================
 * PATCH — UPDATE USER
 * ================================================================
 */

export async function PATCH(request: NextRequest) {
  try {
    const { error } = await authenticateAdmin(request);

    if (error) {
      return error;
    }

    const body = await request.json();

    const {
      id,
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

    /*
     * ------------------------------------------------------------
     * Basic validation
     * ------------------------------------------------------------
     */

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    if (!username || !display_name || !role) {
      return NextResponse.json(
        {
          error:
            "Username, display name, and role are required.",
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

    const cleanUsername = username
      .trim()
      .toLowerCase();

    const cleanDisplayName =
      display_name.trim();

    if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
      return NextResponse.json(
        {
          error:
            "Username may only contain letters, numbers, dots, underscores, and hyphens.",
        },
        { status: 400 }
      );
    }

    if (!cleanDisplayName) {
      return NextResponse.json(
        { error: "Display name is required." },
        { status: 400 }
      );
    }

    /*
     * ------------------------------------------------------------
     * Validate academic year
     * ------------------------------------------------------------
     */

    if (
      role === "student" &&
      year !== null &&
      year !== undefined &&
      year !== ""
    ) {
      const numericYear = Number(year);

      if (
        !Number.isInteger(numericYear) ||
        numericYear < 1 ||
        numericYear > 5
      ) {
        return NextResponse.json(
          {
            error:
              "Academic year must be between 1 and 5.",
          },
          { status: 400 }
        );
      }
    }

    /*
     * ------------------------------------------------------------
     * Find existing user
     * ------------------------------------------------------------
     */

    const {
      data: existingUser,
      error: existingUserError,
    } = await supabaseAdmin
      .from("profiles")
      .select("id, username, role")
      .eq("id", id)
      .maybeSingle();

    if (existingUserError) {
      console.error(
        "Failed to find user:",
        existingUserError.message
      );

      return NextResponse.json(
        { error: "Failed to find user." },
        { status: 500 }
      );
    }

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    /*
     * ------------------------------------------------------------
     * Check username uniqueness
     * ------------------------------------------------------------
     */

    const { data: usernameConflict } =
      await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("username", cleanUsername)
        .neq("id", id)
        .maybeSingle();

    if (usernameConflict) {
      return NextResponse.json(
        { error: "That username is already in use." },
        { status: 409 }
      );
    }

    /*
     * ------------------------------------------------------------
     * Update Auth password if supplied
     * ------------------------------------------------------------
     */

    if (
      password &&
      password.trim().length > 0
    ) {
      const { error: passwordError } =
        await supabaseAdmin.auth.admin.updateUserById(
          id,
          { password }
        );

      if (passwordError) {
        return NextResponse.json(
          {
            error:
              passwordError.message ||
              "Failed to update password.",
          },
          { status: 400 }
        );
      }
    }

    /*
     * ------------------------------------------------------------
     * Update profile
     * ------------------------------------------------------------
     */

    const {
      data: updatedProfile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .update({
        username: cleanUsername,
        display_name: cleanDisplayName,
        role,

        year:
          role === "student" && year !== ""
            ? Number(year)
            : null,

        start_date:
          role === "student" && start_date
            ? start_date
            : null,

        end_date:
          role === "student" && end_date
            ? end_date
            : null,

        exam_date:
          role === "student" && exam_date
            ? exam_date
            : null,

        mentor_id:
          role === "student" && mentor_id
            ? mentor_id
            : null,
      })
      .eq("id", id)
      .select(
        `
          id,
          username,
          display_name,
          role,
          year,
          start_date,
          end_date,
          exam_date,
          mentor_id
        `
      )
      .single();

    if (profileError) {
      return NextResponse.json(
        {
          error:
            `Failed to update profile: ${profileError.message}`,
        },
        { status: 400 }
      );
    }

    /*
     * ------------------------------------------------------------
     * Update Auth email if username changed
     * ------------------------------------------------------------
     */

    const newEmail =
      `${cleanUsername}${MEDIQ_DOMAIN}`;

    const {
      data: authUserData,
      error: authLookupError,
    } =
      await supabaseAdmin.auth.admin.getUserById(
        id
      );

    if (authLookupError) {
      console.error(
        "Failed to retrieve Auth user:",
        authLookupError.message
      );

      return NextResponse.json(
        {
          error:
            "Profile updated, but the authentication account could not be verified.",
          user: updatedProfile,
        },
        { status: 500 }
      );
    }

    if (
      authUserData.user &&
      authUserData.user.email !== newEmail
    ) {
      const { error: emailError } =
        await supabaseAdmin.auth.admin.updateUserById(
          id,
          {
            email: newEmail,
            email_confirm: true,
          }
        );

      if (emailError) {
        console.error(
          "Profile updated but Auth email update failed:",
          emailError.message
        );

        return NextResponse.json(
          {
            error:
              `Profile updated, but authentication email could not be updated: ${emailError.message}`,
            user: updatedProfile,
          },
          { status: 400 }
        );
      }
    }

    /*
     * ------------------------------------------------------------
     * Success
     * ------------------------------------------------------------
     */

    return NextResponse.json({
      success: true,
      user: updatedProfile,
    });
  } catch (error) {
    console.error(
      "Admin user update failed:",
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