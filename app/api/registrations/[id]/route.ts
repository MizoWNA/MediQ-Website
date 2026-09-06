import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Registration ID is required.",
        },
        { status: 400 }
      );
    }

    const {
      data: registration,
      error,
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
          plan,
          base_price,
          affiliate_code,
          discount_percent,
          discount_amount,
          final_price,
          status
        `
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(
        "Failed to fetch registration:",
        error
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

    return NextResponse.json(
      {
        success: true,
        registration,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Registration lookup failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unexpected error while loading registration.",
      },
      { status: 500 }
    );
  }
}