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
        { error: "Missing authorization token." },
        { status: 401 }
      );
    }

    const accessToken = authorization.slice("Bearer ".length).trim();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing authorization token." },
        { status: 401 }
      );
    }

    const {
      data: { user: requestingUser },
      error: authError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !requestingUser) {
      return NextResponse.json(
        { error: "Invalid or expired admin session." },
        { status: 401 }
      );
    }

    /*
     * Check that the authenticated user is actually an admin.
     */

    const { data: adminProfile, error: adminProfileError } =
      await supabaseAdmin
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
        { error: "Failed to verify administrator permissions." },
        { status: 500 }
      );
    }

    if (!adminProfile || adminProfile.role !== "admin") {
      return NextResponse.json(
        { error: "You do not have permission to create accounts." },
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
        { error: "Missing registration ID." },
        { status: 400 }
      );
    }

    /*
     * ================================================================
     * REQUEST BODY
     * ================================================================
     */

    const body = await request.json();

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

    /*
     * ================================================================
     * VALIDATION
     * ================================================================
     */

    if (!username) {
      return NextResponse.json(
        { error: "Username is required." },
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
          error: "Username must be between 3 and 40 characters.",
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "Password must be at least 6 characters long.",
        },
        { status: 400 }
      );
    }

    if (!displayName) {
      return NextResponse.json(
        { error: "Display name is required." },
        { status: 400 }
      );
    }

    /*
     * ================================================================
     * FETCH REGISTRATION
     * ================================================================
     */

    const { data: registration, error: registrationError } =
      await supabaseAdmin
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
        { error: "Failed to load registration." },
        { status: 500 }
      );
    }

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found." },
        { status: 404 }
      );
    }

    /*
     * Don't allow a second account to be created for the same
     * registration.
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
     * CHECK USERNAME
     * ================================================================
     *
     * We use username@med.iq as the actual Supabase Auth email.
     */

    const email = `${username}${MEDIQ_DOMAIN}`;

    /*
     * Check the profiles table first.
     *
     * This gives us a cleaner error than letting the Auth API
     * complain about an already-used username.
     */

    const { data: existingProfile, error: existingProfileError } =
      await supabaseAdmin
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
        { error: "Failed to check username availability." },
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
     * VALIDATE MENTOR
     * ================================================================
     */

    if (mentorId) {
      const { data: mentor, error: mentorError } =
        await supabaseAdmin
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
          { error: "Failed to validate selected mentor." },
          { status: 500 }
        );
      }

      if (!mentor) {
        return NextResponse.json(
          { error: "Selected mentor was not found." },
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
    } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,

      user_metadata: {
        full_name: displayName,
      },

      /*
       * Role belongs in app_metadata because the user should not
       * be able to modify their own authorization-related metadata.
       */
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
     * UPDATE PROFILE
     * ================================================================
     *
     * This assumes your existing auth -> profiles trigger creates
     * the profile row when the Auth user is created.
     */

    const { data: updatedProfile, error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .update({
          username,
          display_name: displayName,
          role: "student",
          mentor_id: mentorId,
        })
        .eq("id", createdUserId)
        .select(
          "id, username, display_name, role, mentor_id"
        )
        .maybeSingle();

    if (profileError) {
      console.error(
        "Failed to update created profile:",
        profileError.message
      );

      /*
       * Roll back the Auth account so we don't leave behind a
       * broken account that isn't linked to the registration.
       */

      await supabaseAdmin.auth.admin.deleteUser(createdUserId);

      createdUserId = null;

      return NextResponse.json(
        {
          error:
            "Account was created, but its profile could not be configured. The account was rolled back.",
        },
        { status: 500 }
      );
    }

    if (!updatedProfile) {
      console.error(
        "Profile row was not found after Auth user creation."
      );

      await supabaseAdmin.auth.admin.deleteUser(createdUserId);

      createdUserId = null;

      return NextResponse.json(
        {
          error:
            "The account was created, but no profile was generated. The account was rolled back.",
        },
        { status: 500 }
      );
    }

    /*
     * ================================================================
     * LINK ACCOUNT TO REGISTRATION
     * ================================================================
     */

    const { data: updatedRegistration, error: linkError } =
      await supabaseAdmin
        .from("registrations")
        .update({
          profile_id: createdUserId,
          status: "confirmed",
        })
        .eq("id", registrationId)
        .is("profile_id", null)
        .select()
        .maybeSingle();

    if (linkError || !updatedRegistration) {
      console.error(
        "Failed to link registration to profile:",
        linkError?.message
      );

      /*
       * Roll everything back if the registration couldn't be linked.
       */

      await supabaseAdmin.auth.admin.deleteUser(createdUserId);

      createdUserId = null;

      return NextResponse.json(
        {
          error:
            "The account was created, but the registration could not be linked. The account was rolled back.",
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

        message: "MediQ account created successfully.",

        account: {
          id: createdUserId,
          email,
          username,
          display_name: displayName,
          mentor_id: mentorId,
        },

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
     * Last-resort cleanup if an unexpected error happened after
     * Auth user creation.
     */

    if (createdUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(
          createdUserId
        );
      } catch (cleanupError) {
        console.error(
          "Failed to clean up partially created Auth user:",
          cleanupError
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