import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const QUESTION_FIELDS = `
  id,
  category,
  question,
  translation,
  sort_order
`;

interface RegistrationAnswer {
  question_id: string;
  answer: number;
}

/*
 * ================================================================
 * GET — FETCH ACTIVE QUESTIONNAIRE
 * ================================================================
 */

export async function GET() {
  try {
    const {
      data: questions,
      error,
    } = await supabase
      .from("registration_questions")
      .select(QUESTION_FIELDS)
      .eq("active", true)
      .order("sort_order", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Failed to fetch registration questions:",
        error.message
      );

      return NextResponse.json(
        {
          error:
            "Failed to load registration questionnaire.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        questions: questions ?? [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Registration questionnaire GET failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unexpected error while loading the questionnaire.",
      },
      { status: 500 }
    );
  }
}

/*
 * ================================================================
 * POST — SUBMIT QUESTIONNAIRE ANSWERS
 * ================================================================
 */

export async function POST(
  request: NextRequest
) {
  try {
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

    /*
     * ================================================================
     * REGISTRATION ID
     * ================================================================
     */

    const registrationId =
      typeof body.registration_id === "string"
        ? body.registration_id.trim()
        : "";

    if (!registrationId) {
      return NextResponse.json(
        {
          error:
            "Registration ID is required.",
        },
        { status: 400 }
      );
    }

    /*
     * ================================================================
     * ANSWERS
     * ================================================================
     */

    if (!Array.isArray(body.answers)) {
      return NextResponse.json(
        {
          error:
            "Answers must be provided as an array.",
        },
        { status: 400 }
      );
    }

    const answers: RegistrationAnswer[] =
      [];

    for (
      const answer of body.answers
    ) {
      if (
        !answer ||
        typeof answer !== "object"
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid answer format.",
          },
          { status: 400 }
        );
      }

      const candidate =
        answer as Record<string, unknown>;

      const questionId =
        typeof candidate.question_id ===
        "string"
          ? candidate.question_id.trim()
          : "";

      const answerValue =
        typeof candidate.answer ===
        "number"
          ? candidate.answer
          : NaN;

      if (!questionId) {
        return NextResponse.json(
          {
            error:
              "Every answer must include a question ID.",
          },
          { status: 400 }
        );
      }

      if (
        !Number.isInteger(
          answerValue
        ) ||
        answerValue < 1 ||
        answerValue > 5
      ) {
        return NextResponse.json(
          {
            error:
              "Each answer must be an integer between 1 and 5.",
          },
          { status: 400 }
        );
      }

      answers.push({
        question_id: questionId,
        answer: answerValue,
      });
    }

    if (answers.length === 0) {
      return NextResponse.json(
        {
          error:
            "At least one answer is required.",
        },
        { status: 400 }
      );
    }

    /*
     * ================================================================
     * DUPLICATE QUESTION CHECK
     * ================================================================
     */

    const questionIds =
      answers.map(
        (answer) =>
          answer.question_id
      );

    const uniqueQuestionIds =
      new Set(questionIds);

    if (
      uniqueQuestionIds.size !==
      questionIds.length
    ) {
      return NextResponse.json(
        {
          error:
            "A question cannot be answered more than once.",
        },
        { status: 400 }
      );
    }

    /*
     * ================================================================
     * SUBMIT THROUGH DATABASE FUNCTION
     * ================================================================
     */

    const {
      data,
      error,
    } = await supabase.rpc(
      "submit_registration_answers",
      {
        p_registration_id:
          registrationId,

        p_answers: answers.map(
          (answer) => ({
            question_id:
              answer.question_id,

            answer:
              answer.answer,
          })
        ),
      }
    );

    if (error) {
      console.error(
        "Failed to submit registration questionnaire:",
        {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        }
      );

      /*
       * ============================================================
       * DATABASE VALIDATION ERRORS
       * ============================================================
       *
       * The RPC intentionally owns the authoritative validation.
       * These messages are safe to return to the questionnaire client.
       */

      return NextResponse.json(
        {
          error:
            error.message ||
            "Failed to submit questionnaire.",
        },
        { status: 400 }
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
        ...(
          data &&
          typeof data === "object"
            ? data
            : {}
        ),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Registration questionnaire POST failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unexpected error while submitting the questionnaire.",
      },
      { status: 500 }
    );
  }
}