import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  REGISTRATION_PLANS,
  type RegistrationPlan,
} from "@/lib/registration-plans";

const MEDIQ_DOMAIN = "@med.iq";

const DEFAULT_PAGE_SIZE = 10;
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
 * PLAN HELPERS
 * ================================================================
 */

function findRegistrationPlan(
  academicYear: number,
  planName: string
): RegistrationPlan | null {
  const plans =
    REGISTRATION_PLANS[academicYear];

  if (!plans) {
    return null;
  }

  return (
    plans.find(
      (plan) =>
        plan.name.toLowerCase() ===
        planName.trim().toLowerCase()
    ) ?? null
  );
}

function calculateEndDate(
  startDate: Date,
  plan: RegistrationPlan
): string {
  const endDate = new Date(startDate);

  if (plan.ending.type === "offset") {
    endDate.setDate(
      endDate.getDate() +
      plan.ending.days
    );
  } else {
    /*
     * Specific-date plans ignore the account's
     * start date and use the configured date.
     */

    return plan.ending.date;
  }

  return endDate
    .toISOString()
    .split("T")[0];
}

/*
 * ================================================================
 * GET — LIST REGISTRATIONS
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

    const searchParams =
      request.nextUrl.searchParams;

    const requestedPage = Number(
      searchParams.get("page") || "1"
    );

    const requestedPageSize = Number(
      searchParams.get("page_size") ||
      DEFAULT_PAGE_SIZE
    );

    const page =
      Number.isInteger(requestedPage)
        ? Math.max(1, requestedPage)
        : 1;

    const pageSize =
      Number.isInteger(
        requestedPageSize
      )
        ? Math.min(
          MAX_PAGE_SIZE,
          Math.max(
            1,
            requestedPageSize
          )
        )
        : DEFAULT_PAGE_SIZE;

    const from =
      (page - 1) * pageSize;

    const to =
      from + pageSize - 1;

    const rawSearch =
      searchParams
        .get("search")
        ?.trim() || "";

    const search = rawSearch
      .replace(/[(),]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const requestedStatus =
      searchParams.get("status");

    const validStatuses = [
      "pending",
      "confirmed",
      "cancelled",
    ] as const;

    const status =
      validStatuses.includes(
        requestedStatus as
        (typeof validStatuses)[number]
      )
        ? requestedStatus
        : null;

    let query = supabaseAdmin
      .from("registrations")
      .select(
        `
          id,
          registration_code,
          full_name,
          university,
          academic_year,
          phone_number,
          email,
          plan,
          base_price,
          affiliate_code,
          discount_percent,
          discount_amount,
          final_price,
          status,
          created_at,
          paid_at,
          paid_by,
          profile_id
        `,
        {
          count: "exact",
        }
      );

    if (status) {
      query = query.eq(
        "status",
        status
      );
    } else {
      query = query.eq(
        "status",
        "pending"
      );
    }

    if (search) {
      query = query.or(
        [
          `full_name.ilike.%${search}%`,
          `registration_code.ilike.%${search}%`,
          `phone_number.ilike.%${search}%`,
          `university.ilike.%${search}%`,
          `email.ilike.%${search}%`,
        ].join(",")
      );
    }

    query = query
      .order("created_at", {
        ascending: false,
      })
      .range(from, to);

    const {
      data: registrations,
      error: registrationsError,
      count,
    } = await query;

    if (registrationsError) {
      console.error(
        "Failed to fetch registrations:",
        registrationsError.message
      );

      return NextResponse.json(
        {
          error:
            "Failed to load registrations.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      registrations:
        registrations ?? [],
      total: count ?? 0,
      page,
      page_size: pageSize,
      total_pages: Math.max(
        1,
        Math.ceil(
          (count ?? 0) /
          pageSize
        )
      ),
    });
  } catch (error) {
    console.error(
      "Admin registration listing failed:",
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
 * POST — APPROVE REGISTRATION
 * ================================================================
 *
 * Creates:
 *
 *   registrations
 *          ↓
 *   Supabase Auth user
 *          ↓
 *   profiles row
 *
 * Then links everything together.
 *
 * ================================================================
 */

export async function POST(
  request: NextRequest
) {
  try {
    const {
      user: adminUser,
      error,
    } = await authenticateAdmin(
      request
    );

    if (error) {
      return error;
    }

    const body = await request.json();

    const {
      registration_id,
      username,
      password,
      display_name,
      phone_number,
      registration_code,
      affiliate_code,
    } = body;

    /*
     * ------------------------------------------------------------
     * Basic validation
     * ------------------------------------------------------------
     */

    if (!registration_id) {
      return NextResponse.json(
        {
          error:
            "Registration ID is required.",
        },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        {
          error:
            "Username is required.",
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          error:
            "Password is required.",
        },
        { status: 400 }
      );
    }

    if (!display_name) {
      return NextResponse.json(
        {
          error:
            "Display name is required.",
        },
        { status: 400 }
      );
    }

    /*
     * ------------------------------------------------------------
     * Clean editable values
     * ------------------------------------------------------------
     */

    const cleanUsername =
      username
        .trim()
        .toLowerCase();

    const cleanDisplayName =
      display_name.trim();

    const cleanPhoneNumber =
      phone_number?.trim() || null;

    const cleanRegistrationCode =
      registration_code?.trim() || null;

    const cleanAffiliateCode =
      affiliate_code?.trim() || null;

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

    if (!cleanDisplayName) {
      return NextResponse.json(
        {
          error:
            "Display name is required.",
        },
        { status: 400 }
      );
    }

    /*
     * ------------------------------------------------------------
     * Fetch registration
     * ------------------------------------------------------------
     */

    const {
      data: registration,
      error: registrationError,
    } = await supabaseAdmin
      .from("registrations")
      .select(
        `
          id,
          registration_code,
          full_name,
          university,
          academic_year,
          phone_number,
          email,
          plan,
          affiliate_code,
          status
        `
      )
      .eq(
        "id",
        registration_id
      )
      .maybeSingle();

    if (registrationError) {
      console.error(
        "Failed to fetch registration:",
        registrationError.message
      );

      return NextResponse.json(
        {
          error:
            "Failed to load registration.",
        },
        { status: 500 }
      );
    }

    if (!registration) {
      return NextResponse.json(
        {
          error:
            "Registration not found.",
        },
        { status: 404 }
      );
    }

    /*
     * ------------------------------------------------------------
     * Prevent double approval
     * ------------------------------------------------------------
     */

    if (
      registration.status !==
      "pending"
    ) {
      return NextResponse.json(
        {
          error:
            `This registration has already been ${registration.status}.`,
        },
        { status: 409 }
      );
    }

    /*
     * ------------------------------------------------------------
     * Validate plan
     * ------------------------------------------------------------
     */

    const plan =
      findRegistrationPlan(
        registration.academic_year,
        registration.plan
      );

    if (!plan) {
      return NextResponse.json(
        {
          error:
            "The registration plan no longer exists in the current plan configuration.",
        },
        { status: 400 }
      );
    }

    /*
     * ------------------------------------------------------------
     * Check username uniqueness
     * ------------------------------------------------------------
     */

    const {
      data: usernameConflict,
      error: usernameError,
    } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq(
        "username",
        cleanUsername
      )
      .maybeSingle();

    if (usernameError) {
      console.error(
        "Username lookup failed:",
        usernameError.message
      );

      return NextResponse.json(
        {
          error:
            "Failed to check username availability.",
        },
        { status: 500 }
      );
    }

    if (usernameConflict) {
      return NextResponse.json(
        {
          error:
            "That username is already in use.",
        },
        { status: 409 }
      );
    }

    /*
     * ------------------------------------------------------------
     * Calculate account dates
     * ------------------------------------------------------------
     */

    const startDate =
      new Date();

    const startDateString =
      startDate
        .toISOString()
        .split("T")[0];

    const endDate =
      calculateEndDate(
        startDate,
        plan
      );

    /*
     * ------------------------------------------------------------
     * Create Supabase Auth account
     * ------------------------------------------------------------
     */

    const email =
      `${cleanUsername}${MEDIQ_DOMAIN}`;

    const {
      data: authData,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.createUser(
        {
          email,
          password,
          email_confirm: true,
        }
      );

    if (
      authError ||
      !authData.user
    ) {
      return NextResponse.json(
        {
          error:
            authError?.message ||
            "Failed to create authentication account.",
        },
        { status: 400 }
      );
    }

    const newUserId =
      authData.user.id;

    /*
     * ------------------------------------------------------------
     * Create profile
     * ------------------------------------------------------------
     */

    const {
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: newUserId,

        username: cleanUsername,
        display_name: cleanDisplayName,

        phone_number: cleanPhoneNumber,a
        university: registration.university,

        role: "student",

        year: registration.academic_year,

        start_date: startDateString,
        end_date: endDate,

        mentor_id: null,

        first_time: true,
        status: "active",

        registration_code:
          cleanRegistrationCode ||
          registration.registration_code,

        affiliate_code:
          cleanAffiliateCode ||
          registration.affiliate_code,

        plan: registration.plan,
      });

    /*
     * ------------------------------------------------------------
     * Roll back Auth account if profile fails
     * ------------------------------------------------------------
     */

    if (profileError) {
      console.error(
        "Profile creation failed:",
        profileError.message
      );

      await supabaseAdmin.auth.admin.deleteUser(
        newUserId
      );

      return NextResponse.json(
        {
          error:
            `Profile creation failed: ${profileError.message}`,
        },
        { status: 400 }
      );
    }

    /*
     * ------------------------------------------------------------
     * Mark registration as confirmed
     * ------------------------------------------------------------
     */

    const {
      data: updatedRegistration,
      error:
      registrationUpdateError,
    } = await supabaseAdmin
      .from("registrations")
      .update({
        status: "confirmed",

        paid_at:
          new Date().toISOString(),

        paid_by:
          adminUser?.id ?? null,

        profile_id:
          newUserId,
      })
      .eq(
        "id",
        registration.id
      )
      .eq(
        "status",
        "pending"
      )
      .select()
      .single();

    /*
     * ------------------------------------------------------------
     * Roll back profile + Auth if registration
     * update failed.
     * ------------------------------------------------------------
     */

    if (
      registrationUpdateError ||
      !updatedRegistration
    ) {
      console.error(
        "Registration confirmation failed:",
        registrationUpdateError?.message
      );

      await supabaseAdmin
        .from("profiles")
        .delete()
        .eq(
          "id",
          newUserId
        );

      await supabaseAdmin.auth.admin.deleteUser(
        newUserId
      );

      return NextResponse.json(
        {
          error:
            registrationUpdateError?.message ||
            "Failed to confirm registration.",
        },
        { status: 500 }
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

        registration:
          updatedRegistration,

        user: {
          id: newUserId,
          username:
            cleanUsername,
          email,
          display_name:
            cleanDisplayName,
          start_date:
            startDateString,
          end_date:
            endDate,
          plan:
            registration.plan,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Admin registration approval failed:",
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