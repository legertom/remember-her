import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { entries } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEntries = await db
    .select()
    .from(entries)
    .where(eq(entries.userId, userId))
    .orderBy(desc(entries.createdAt));

  return NextResponse.json(userEntries);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, notes, category } = body;

  if (!name || !category) {
    return NextResponse.json(
      { error: "Name and category are required" },
      { status: 400 }
    );
  }

  const [newEntry] = await db
    .insert(entries)
    .values({
      userId,
      name,
      notes: notes || "",
      category,
    })
    .returning();

  return NextResponse.json(newEntry, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  await db
    .delete(entries)
    .where(and(eq(entries.id, id), eq(entries.userId, userId)));

  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, name, notes, category } = body;

  if (!id || !name || !category) {
    return NextResponse.json(
      { error: "ID, name, and category are required" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(entries)
    .set({
      name,
      notes: notes || "",
      category,
      updatedAt: new Date(),
    })
    .where(and(eq(entries.id, id), eq(entries.userId, userId)))
    .returning();

  return NextResponse.json(updated);
}
