import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const existing = await prisma.creditCard.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const { isBlocked, cardHolderName, expiryDate } = body;

    const updated = await prisma.creditCard.update({
      where: { id },
      data: {
        ...(typeof isBlocked === "boolean" ? { isBlocked } : {}),
        ...(cardHolderName ? { cardHolderName } : {}),
        ...(expiryDate ? { expiryDate } : {}),
      },
      select: {
        id: true,
        cardNumberMasked: true,
        cardHolderName: true,
        expiryDate: true,
        totalLimit: true,
        availableLimit: true,
        outstandingAmount: true,
        minimumDue: true,
        dueDate: true,
        isBlocked: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating credit card:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const existing = await prisma.creditCard.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.creditCard.delete({ where: { id } });

    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    console.error("Error deleting credit card:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
