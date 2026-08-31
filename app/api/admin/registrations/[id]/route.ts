import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
] as const;

type RegistrationStatus = (typeof VALID_STATUSES)[number];

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

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    /*
     * ============================================================
     * AUTHENTICATION
     * ============================================================
     */

    const { error } = await authenticateAdmin(request);

    if (error) {
      return error;
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Registration ID is required." },
        { status: 400 }
      );
    }

    /*
     * ============================================================
     * PARSE REQUEST
     * ============================================================
     */

    const body = await request.json();

    /*
     * ============================================================
     * CHECK REGISTRATION EXISTS
     * ============================================================
     */

    const {
      data: existingRegistration,
      error: existingError,
    } = await supabaseAdmin
      .from("registrations")
      .select(
        `
          id,
          status
        `
      )
      .eq("id", id)
      .maybeSingle();

    if (existingError) {
      console.error(
        "Failed to load registration:",
        existingError.message
      );

      return NextResponse.json(
        {
          error: "Failed to load registration.",
        },
        { status: 500 }
      );
    }

    if (!existingRegistration) {
      return NextResponse.json(
        {
          error: "Registration not found.",
        },
        { status: 404 }
      );
    }

    /*
     * ============================================================
     * STATUS UPDATE
     *
     * This is intentionally handled BEFORE the normal edit
     * validation.
     *
     * This allows the frontend to send:
     *
     * {
     *   status: "cancelled"
     * }
     *
     * without also sending full_name, plan, academic_year, etc.
     * ============================================================
     */

    if ("status" in body) {
      const requestedStatus = body.status;

      if (
        typeof requestedStatus !== "string" ||
        !VALID_STATUSES.includes(
          requestedStatus as RegistrationStatus
        )
      ) {
        return NextResponse.json(
          {
            error: "Invalid registration status.",
          },
          { status: 400 }
        );
      }

      /*
       * For now, only pending registrations can have their
       * status changed through this endpoint.
       *
       * This prevents accidentally modifying a confirmed
       * registration/account.
       */
      if (existingRegistration.status !== "pending") {
        return NextResponse.json(
          {
            error:
              "Only pending registrations can have their status changed.",
          },
          { status: 409 }
        );
      }

      /*
       * We only want the cancellation action here.
       *
       * Confirming a registration should happen through the
       * account-creation flow rather than manually changing
       * the status.
       */
      if (requestedStatus !== "cancelled") {
        return NextResponse.json(
          {
            error:
              "The only supported status change from this endpoint is cancellation.",
          },
          { status: 400 }
        );
      }

      const {
        data: cancelledRegistration,
        error: cancelError,
      } = await supabaseAdmin
        .from("registrations")
        .update({
          status: "cancelled",
        })
        .eq("id", id)
        .eq("status", "pending")
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
          `
        )
        .single();

      if (cancelError || !cancelledRegistration) {
        console.error(
          "Failed to cancel registration:",
          cancelError?.message
        );

        return NextResponse.json(
          {
            error:
              cancelError?.message ||
              "Failed to cancel registration.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        registration: cancelledRegistration,
      });
    }

    /*
     * ============================================================
     * NORMAL REGISTRATION EDIT
     * ============================================================
     */

    const {
      full_name,
      university,
      academic_year,
      phone_number,
      email,
      plan,
      affiliate_code,
      registration_code,
    } = body;

    /*
     * ------------------------------------------------------------
     * Only pending registrations can be edited.
     * ------------------------------------------------------------
     */

    if (existingRegistration.status !== "pending") {
      return NextResponse.json(
        {
          error:
            "Only pending registrations can be edited.",
        },
        { status: 409 }
      );
    }

    /*
     * ------------------------------------------------------------
     * Basic validation
     * ------------------------------------------------------------
     */

    if (
      typeof full_name !== "string" ||
      !full_name.trim()
    ) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(academic_year) ||
      academic_year < 1 ||
      academic_year > 5
    ) {
      return NextResponse.json(
        { error: "Invalid academic year." },
        { status: 400 }
      );
    }

    if (
      typeof plan !== "string" ||
      !plan.trim()
    ) {
      return NextResponse.json(
        { error: "Plan is required." },
        { status: 400 }
      );
    }

    if (
      typeof registration_code !== "string" ||
      !registration_code.trim()
    ) {
      return NextResponse.json(
        { error: "Registration code is required." },
        { status: 400 }
      );
    }

    /*
     * ------------------------------------------------------------
     * Clean values
     * ------------------------------------------------------------
     */

    const cleanFullName = full_name.trim();

    const cleanUniversity =
      typeof university === "string"
        ? university.trim() || null
        : null;

    const cleanPhoneNumber =
      typeof phone_number === "string"
        ? phone_number.trim() || null
        : null;

    const cleanEmail =
      typeof email === "string"
        ? email.trim() || null
        : null;

    const cleanPlan = plan.trim();

    const cleanAffiliateCode =
      typeof affiliate_code === "string"
        ? affiliate_code.trim() || null
        : null;

    const cleanRegistrationCode =
      registration_code.trim();

    /*
     * ============================================================
     * UPDATE REGISTRATION
     * ============================================================
     */

    const {
      data: updatedRegistration,
      error: updateError,
    } = await supabaseAdmin
      .from("registrations")
      .update({
        full_name: cleanFullName,
        university: cleanUniversity,
        academic_year,
        phone_number: cleanPhoneNumber,
        email: cleanEmail,
        plan: cleanPlan,
        affiliate_code: cleanAffiliateCode,
        registration_code: cleanRegistrationCode,
      })
      .eq("id", id)
      .eq("status", "pending")
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
        `
      )
      .single();

    if (updateError || !updatedRegistration) {
      console.error(
        "Failed to update registration:",
        updateError?.message
      );

      return NextResponse.json(
        {
          error:
            updateError?.message ||
            "Failed to update registration.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
    });
  } catch (error) {
    console.error(
      "Admin registration update failed:",
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
