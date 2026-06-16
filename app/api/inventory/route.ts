import { NextResponse } from "next/server";

export async function GET() {
  try {
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;

    if (!appsScriptUrl) {
      return NextResponse.json(
        { success: false, message: "APPS_SCRIPT_URL belum diatur." },
        { status: 500 }
      );
    }

    const response = await fetch(`${appsScriptUrl}?action=inventory`, {
      cache: "no-store",
      redirect: "follow",
    });

    const text = await response.text();

    if (!text.trim().startsWith("{") && !text.trim().startsWith("[")) {
      console.error("Apps Script returned HTML/non-JSON:", text.slice(0, 500));

      return NextResponse.json(
        {
          success: false,
          message:
            "Apps Script tidak mengembalikan JSON. Cek URL Web App, permission deploy, atau pastikan pakai URL /exec.",
          preview: text.slice(0, 200),
        },
        { status: 500 }
      );
    }

    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Inventory API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil inventory.",
      },
      { status: 500 }
    );
  }
}