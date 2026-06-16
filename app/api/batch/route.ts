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

    const response = await fetch(`${appsScriptUrl}?action=batch`, {
      cache: "no-store",
      redirect: "follow",
    });

    const text = await response.text();

    if (!text.trim().startsWith("{")) {
      return NextResponse.json(
        {
          success: false,
          message: "Apps Script tidak mengembalikan JSON.",
          preview: text.slice(0, 300),
        },
        { status: 500 }
      );
    }

    const data = JSON.parse(text);

    return NextResponse.json(data, {
      status: data.success ? 200 : 500,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Gagal mengambil batch.",
      },
      { status: 500 }
    );
  }
}