import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message =
      typeof body.message === "string" ? body.message.trim().slice(0, 600) : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (message.length < 4) {
      return NextResponse.json(
        { error: "Please enter an observation of at least 4 characters." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        id: `obs-${crypto.randomUUID().slice(0, 8)}`,
        name: name || "Anonymous Observer",
        status: "pending_moderation",
        submittedAt: new Date().toISOString(),
        message: "Queued for curatorial moderation before wall publication.",
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid submission payload." },
      { status: 400 }
    );
  }
}
