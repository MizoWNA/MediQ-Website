import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function authenticateAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const accessToken = authorization.slice("Bearer ".length);
  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Invalid authentication session." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  return null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authError = await authenticateAdmin(request);
    if (authError) return authError;

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: "Registration ID is required." }, { status: 400 });

    const { data: registration, error: registrationError } = await supabaseAdmin
      .from("registrations")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (registrationError) {
      console.error("Failed to verify registration:", registrationError.message);
      return NextResponse.json({ error: "Failed to load registration." }, { status: 500 });
    }
    if (!registration) return NextResponse.json({ error: "Registration not found." }, { status: 404 });

    const [{ data: questions, error: questionsError }, { data: answers, error: answersError }] = await Promise.all([
      supabaseAdmin
        .from("registration_questions")
        .select("id, category, question, translation, sort_order")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("registration_answers")
        .select("question_id, answer")
        .eq("registration_id", id),
    ]);

    if (questionsError || answersError) {
      console.error("Failed to load questionnaire:", questionsError?.message ?? answersError?.message);
      return NextResponse.json({ error: "Failed to load questionnaire." }, { status: 500 });
    }

    const answerByQuestion = new Map((answers ?? []).map((answer) => [answer.question_id, answer.answer]));
    return NextResponse.json({
      registration_id: id,
      answers: (questions ?? []).map((question) => ({
        question_id: question.id,
        category: question.category,
        question: question.question,
        translation: question.translation,
        sort_order: question.sort_order,
        answer: answerByQuestion.get(question.id) ?? null,
      })),
    });
  } catch (error) {
    console.error("Admin questionnaire failed:", error);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
