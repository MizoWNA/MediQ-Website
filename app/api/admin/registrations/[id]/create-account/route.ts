import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MEDIQ_DOMAIN = "@med.iq";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  let createdUserId: string | null = null;

  try {
    /*
     * ================================================================
     * AUTHENTICATE REQUESTER
     * ================================================================
     */

    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Missing authorization token.",
        },
        { status: 401 }
      );
    }

    const accessToken = authorization
      .slice("Bearer ".length)
      .trim();

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "Missing authorization token.",
        },
        { status: 401 }
      );
    }

    const {
      data: { user: requestingUser },
      error: authError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !requestingUser) {
      return NextResponse.json(
        {
          error: "Invalid or expired admin session.",
        },
        { status: 401 }
      );
    }

    /*
     * ================================================================
     * VERIFY ADMIN
     * ================================================================
     */

    const {
      data: adminProfile,
      error: adminProfileError,
    } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", requestingUser.id)
      .maybeSingle();

    if (adminProfileError) {
      console.error(
        "Failed to verify admin profile:",
        adminProfileError.message
      );

      return NextResponse.json(
        {
          error:
            "Failed to verify administrator permissions.",
        },
        { status: 500 }
      );
    }

    if (!adminProfile || adminProfile.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "You do not have permission to create accounts.",
        },
        { status: 403 }
      );
    }

    /*
     * ================================================================
     * REGISTRATION ID
     * ================================================================
     */

    const { id: registrationId } = await params;

    if (!registrationId) {
      return NextResponse.json(
        {
          error: "Missing registration ID.",
        },
        { status: 400 }
      );
    }

    /*
     * ================================================================
     * REQUEST BODY
     * ================================================================
     */

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const username =
      typeof body.username === "string"
        ? body.username.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const displayName =
      typeof body.display_name === "string"
        ? body.display_name.trim()
        : "";

    const mentorId =
      typeof body.mentor_id === "string" &&
      body.mentor_id.trim()
        ? body.mentor_id.trim()
        : null;

    const examDate =
      typeof body.exam_date === "string" &&
      body.exam_date.trim()
        ? body.exam_date.trim()
        : null;

    /*
     * ================================================================
     * VALIDATION
     * ================================================================
     */

    if (!username) {
      return NextResponse.json(
        {
          error: "Username is required.",
        },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9][a-z0-9._-]*$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username may only contain lowercase letters, numbers, dots, underscores, and hyphens.",
        },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 40) {
      return NextResponse.json(
        {
          error:
            "Username must be between 3 and 40 characters.",
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          error: "Password is required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 6 characters long.",
        },
        { status: 400 }
      );
    }

    if (!displayName) {
      return NextResponse.json(
        {
          error: "Display name is required.",
        },
        { status: 400 }
      );
    }

    /*
     * ================================================================
     * FETCH REGISTRATION
     * ================================================================
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
          final_price,
          status,
          profile_id
        `
      )
      .eq("id", registrationId)
      .maybeSingle();

    if (registrationError) {
      console.error(
        "Failed to fetch registration:",
        registrationError.message
      );

      return NextResponse.json(
        {
          error: "Failed to load registration.",
        },
        { status: 500 }
      );
    }

    if (!registration) {
      return NextResponse.json(
        {
          error: "Registration not found.",
        },
        { status: 404 }
      );
    }

    /*
     * ================================================================
     * REGISTRATION VALIDATION
     * ================================================================
     */

    if (registration.profile_id) {
      return NextResponse.json(
        {
          error:
            "This registration already has a MediQ account.",
        },
        { status: 409 }
      );
    }

    if (registration.status === "cancelled") {
      return NextResponse.json(
        {
          error:
            "A cancelled registration cannot be converted into an account.",
        },
        { status: 400 }
      );
    }

    /*
     * ================================================================
     * AUTH EMAIL
     * ================================================================
     *
     * The username becomes the student's actual Supabase Auth email:
     *
     *     username@med.iq
     */

    const email = `${username}${MEDIQ_DOMAIN}`;

    /*
     * ================================================================
     * CHECK USERNAME IN PROFILES
     * ================================================================
     */

    const {
      data: existingProfile,
      error: existingProfileError,
    } = await supabaseAdmin
      .from("profiles")
      .select("id, username")
      .eq("username", username)
      .maybeSingle();

    if (existingProfileError) {
      console.error(
        "Failed to check username:",
        existingProfileError.message
      );

      return NextResponse.json(
        {
          error:
            "Failed to check username availability.",
        },
        { status: 500 }
      );
    }

    if (existingProfile) {
      return NextResponse.json(
        {
          error: `The username "${username}" is already in use.`,
        },
        { status: 409 }
      );
    }

    /*
     * ================================================================
     * CHECK AUTH EMAIL
     * ================================================================
     *
     * The profile check above normally catches this, but checking
     * Auth as well protects against orphaned Auth users or a profile
     * that somehow doesn't contain the username.
     */

    const {
      data: existingAuthUser,
      error: existingAuthUserError,
    } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (existingAuthUserError) {
      console.error(
        "Failed to check existing Auth users:",
        existingAuthUserError.message
      );

      return NextResponse.json(
        {
          error:
            "Failed to check account availability.",
        },
        { status: 500 }
      );
    }

    const authEmailAlreadyExists =
      existingAuthUser.users.some(
        (user) =>
          user.email?.toLowerCase() === email.toLowerCase()
      );

    if (authEmailAlreadyExists) {
      return NextResponse.json(
        {
          error:
            `The login "${email}" is already in use.`,
        },
        { status: 409 }
      );
    }

    /*
     * ================================================================
     * VALIDATE MENTOR
     * ================================================================
     */

    if (mentorId) {
      const {
        data: mentor,
        error: mentorError,
      } = await supabaseAdmin
        .from("profiles")
        .select("id, role")
        .eq("id", mentorId)
        .maybeSingle();

      if (mentorError) {
        console.error(
          "Failed to validate mentor:",
          mentorError.message
        );

        return NextResponse.json(
          {
            error:
              "Failed to validate selected mentor.",
          },
          { status: 500 }
        );
      }

      if (!mentor) {
        return NextResponse.json(
          {
            error: "Selected mentor was not found.",
          },
          { status: 400 }
        );
      }

      if (mentor.role !== "mentor") {
        return NextResponse.json(
          {
            error:
              "The selected user is not registered as a mentor.",
          },
          { status: 400 }
        );
      }
    }

    /*
     * ================================================================
     * CREATE AUTH USER
     * ================================================================
     */

    const {
      data: authData,
      error: createUserError,
    } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,

        user_metadata: {
          full_name: displayName,
        },

        app_metadata: {
          role: "student",
        },
      });

    if (createUserError || !authData.user) {
      console.error(
        "Failed to create Auth user:",
        createUserError?.message
      );

      return NextResponse.json(
        {
          error:
            createUserError?.message ||
            "Failed to create account.",
        },
        { status: 400 }
      );
    }

    createdUserId = authData.user.id;

    /*
     * ================================================================
     * CREATE / CONFIGURE PROFILE
     * ================================================================
     *
     * IMPORTANT:
     *
     * We do NOT assume an auth.users -> profiles trigger exists.
     *
     * If a trigger already created the profile, upsert() updates it.
     *
     * If no trigger exists, upsert() creates it.
     *
     * This makes account creation work either way.
     */

    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: createdUserId,

          username,
          display_name: displayName,

          role: "student",

          year: registration.academic_year,

          mentor_id: mentorId,

          registration_code:
            registration.registration_code,

          affiliate_code:
            registration.affiliate_code,
          
          exam_date: examDate,


          plan: registration.plan,

          phone_number:
            registration.phone_number,

          university:
            registration.university,

          status: "active",

          first_time: true,
        },
        {
          onConflict: "id",
        }
      )
      .select(
        `
          id,
          username,
          display_name,
          role,
          year,
          mentor_id,
          registration_code,
          affiliate_code,
          plan,
          phone_number,
          university,
          status,
          first_time,
          created_at
        `
      )
      .single();

    if (profileError || !profile) {
      console.error(
        "Failed to create/configure profile:",
        profileError?.message
      );

      /*
       * Roll back Auth user.
       *
       * profiles.id references auth.users(id), so deleting the Auth
       * user will also remove the profile if the FK is configured
       * with CASCADE. Otherwise we explicitly attempt to remove it.
       */

      await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", createdUserId);

      await supabaseAdmin.auth.admin.deleteUser(
        createdUserId
      );

      createdUserId = null;

      return NextResponse.json(
        {
          error:
            "The account was created, but its profile could not be generated. The account was rolled back.",
          details: profileError?.message || undefined,
        },
        { status: 500 }
      );
    }

/*
 * ================================================================
 * LINK ACCOUNT TO REGISTRATION
 * ================================================================
 */

const { error: linkError } = await supabaseAdmin
  .from("registrations")
  .update({
    profile_id: createdUserId,
    status: "confirmed",
  })
  .eq("id", registrationId);

if (linkError) {
  console.error("FAILED TO LINK REGISTRATION:", {
    message: linkError.message,
    details: linkError.details,
    hint: linkError.hint,
    code: linkError.code,
    registrationId,
    createdUserId,
  });

  await supabaseAdmin.auth.admin.deleteUser(createdUserId);
  createdUserId = null;

  return NextResponse.json(
    {
      error: "Failed to link the account to the registration.",
      details: {
        message: linkError.message,
        details: linkError.details,
        hint: linkError.hint,
        code: linkError.code,
      },
    },
    { status: 500 }
  );
}

/*
 * Verify the registration was actually linked.
 */

const { data: updatedRegistration, error: verifyError } =
  await supabaseAdmin
    .from("registrations")
    .select("*")
    .eq("id", registrationId)
    .maybeSingle();

if (verifyError) {
  console.error("FAILED TO VERIFY REGISTRATION LINK:", {
    message: verifyError.message,
    details: verifyError.details,
    hint: verifyError.hint,
    code: verifyError.code,
  });

  await supabaseAdmin.auth.admin.deleteUser(createdUserId);
  createdUserId = null;

  return NextResponse.json(
    {
      error:
        "The registration was updated, but the link could not be verified.",
    },
    { status: 500 }
  );
}

if (!updatedRegistration) {
  console.error(
    "Registration disappeared after linking:",
    registrationId
  );

  await supabaseAdmin.auth.admin.deleteUser(createdUserId);
  createdUserId = null;

  return NextResponse.json(
    {
      error:
        "The registration could not be found after linking.",
    },
    { status: 500 }
  );
}

if (updatedRegistration.profile_id !== createdUserId) {
  console.error("REGISTRATION PROFILE ID MISMATCH:", {
    expected: createdUserId,
    actual: updatedRegistration.profile_id,
  });

  await supabaseAdmin.auth.admin.deleteUser(createdUserId);
  createdUserId = null;

  return NextResponse.json(
    {
      error:
        "The registration was updated with an incorrect profile.",
    },
    { status: 500 }
  );
}
    /*
     * ================================================================
     * SUCCESS
     * ================================================================
     */

    return NextResponse.json(
      {
        success: true,

        message:
          "MediQ account created successfully.",

        account: {
          id: createdUserId,
          email,
          username,
          display_name: displayName,
          mentor_id: mentorId,
        },

        profile,

        registration: updatedRegistration,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create registration account failed:",
      error
    );

    /*
     * ================================================================
     * LAST-RESORT CLEANUP
     * ================================================================
     */

    if (createdUserId) {
      try {
        await supabaseAdmin
          .from("profiles")
          .delete()
          .eq("id", createdUserId);
      } catch (profileCleanupError) {
        console.error(
          "Failed to clean up partially created profile:",
          profileCleanupError
        );
      }

      try {
        await supabaseAdmin.auth.admin.deleteUser(
          createdUserId
        );
      } catch (authCleanupError) {
        console.error(
          "Failed to clean up partially created Auth user:",
          authCleanupError
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while creating account.",
      },
      { status: 500 }
    );
  }
}