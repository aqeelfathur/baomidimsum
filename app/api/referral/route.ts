import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;

    if (!appsScriptUrl) {
      return NextResponse.json(
        { success: false, message: "APPS_SCRIPT_URL belum diatur." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "validateReferral",
        code: body.code,
      }),
    });

    const text = await response.text();
    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal validasi referral.",
      },
      { status: 500 }
    );
  }
}