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
 *
 * Supports:
 *
 * ?page=1
 * ?page_size=8
 * ?search=ahmed
 * ?role=student
 *
 * Only the requested page is returned.
 *
 * ================================================================
 */

export async function GET(request: NextRequest) {
  try {
    const { error } = await authenticateAdmin(request);

    if (error) {
      return error;
    }

    const searchParams = request.nextUrl.searchParams;

    /*
     * ------------------------------------------------------------
     * Pagination
     * ------------------------------------------------------------
     */

    const requestedPage = Number(
      searchParams.get("page") || "1"
    );

    const requestedPageSize = Number(
      searchParams.get("page_size") ||
        DEFAULT_PAGE_SIZE
    );

    const page = Number.isInteger(requestedPage)
      ? Math.max(1, requestedPage)
      : 1;

    const pageSize = Number.isInteger(
      requestedPageSize
    )
      ? Math.min(
          MAX_PAGE_SIZE,
          Math.max(1, requestedPageSize)
        )
      : DEFAULT_PAGE_SIZE;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    /*
     * ------------------------------------------------------------
     * Search
     * ------------------------------------------------------------
     */

    const rawSearch =
      searchParams.get("search")?.trim() || "";

    /*
     * Prevent PostgREST filter syntax from being
     * accidentally injected through the search field.
     */

    const search = rawSearch
      .replace(/[(),]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    /*
     * ------------------------------------------------------------
     * Role filter
     * ------------------------------------------------------------
     */

    const role = searchParams.get("role");

    /*
     * ------------------------------------------------------------
     * Build query
     * ------------------------------------------------------------
     */

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

    /*
     * Role filtering.
     */

    if (role === "student" || role === "mentor") {
      query = query.eq("role", role);
    }

    /*
     * Search both display name and username.
     */

    if (search) {
      query = query.or(
        `display_name.ilike.%${search}%,username.ilike.%${search}%`
      );
    }

    /*
     * Stable ordering + pagination.
     */

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
     * ------------------------------------------------------------
     * Fetch mentor names
     * ------------------------------------------------------------
     *
     * We only fetch mentors belonging to users on the
     * current page.
     * ------------------------------------------------------------
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
          .select(
            "id, username, display_name"
          )
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
      mentors.map((mentor) => [
        mentor.id,
        mentor,
      ])
    );

    /*
     * ------------------------------------------------------------
     * Format response
     * ------------------------------------------------------------
     */

    const formattedUsers = (users ?? []).map(
      (user) => {
        const mentor = user.mentor_id
          ? mentorMap.get(user.mentor_id) ?? null
          : null;

        return {
          ...user,
          mentor: mentor
            ? {
                id: mentor.id,
                username: mentor.username,
                display_name:
                  mentor.display_name,
              }
            : null,
        };
      }
    );

    /*
     * ------------------------------------------------------------
     * Response
     * ------------------------------------------------------------
     */

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
    /*
     * Authenticate the requesting user.
     */

    const { error } =
      await authenticateAdmin(request);

    if (error) {
      return error;
    }

    /*
     * Read request body.
     */

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

    /*
     * Basic validation.
     */

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

    if (
      !["student", "mentor"].includes(role)
    ) {
      return NextResponse.json(
        { error: "Invalid role." },
        { status: 400 }
      );
    }

    const cleanUsername = username
      .trim()
      .toLowerCase();

    if (
      !/^[a-z0-9._-]+$/.test(
        cleanUsername
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Username may only contain letters, numbers, dots, underscores, and hyphens.",
        },
        { status: 400 }
      );
    }

    const email =
      `${cleanUsername}${MEDIQ_DOMAIN}`;

    /*
     * ------------------------------------------------------------
     * Create Supabase Auth user
     * ------------------------------------------------------------
     */

    const {
      data: authData,
      error: createAuthError,
    } =
      await supabaseAdmin.auth.admin.createUser(
        {
          email,
          password,
          email_confirm: true,
        }
      );

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

    const newUserId =
      authData.user.id;

    /*
     * ------------------------------------------------------------
     * Create linked profile
     * ------------------------------------------------------------
     */

    const {
      error: createProfileError,
    } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: newUserId,
        username: cleanUsername,
        display_name,
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
     * ------------------------------------------------------------
     * Roll back Auth user if profile creation failed
     * ------------------------------------------------------------
     */

    if (createProfileError) {
      await supabaseAdmin.auth.admin.deleteUser(
        newUserId
      );

      return NextResponse.json(
        {
          error: `Profile creation failed: ${createProfileError.message}`,
        },
        { status: 400 }
      );
    }

    /*
     * ------------------------------------------------------------
     * Success
     * ------------------------------------------------------------
     */

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