import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function maskCardNumber(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, "");
  const last4 = digits.slice(-4);
  return `**** **** **** ${last4}`;
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cards = await prisma.creditCard.findMany({
      where: { userId: session.user.id },
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

    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error fetching credit cards:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const {
      cardNumber,
      cvv,
      cardHolderName,
      expiryDate,
      totalLimit = 0,
      dueDate = "",
    } = body;

    if (!cardNumber || !cvv || !cardHolderName || !expiryDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cardNumberMasked = maskCardNumber(cardNumber);

    const created = await prisma.creditCard.create({
      data: {
        cardNumber: cardNumber.toString(),
        cvv: cvv.toString(),
        cardNumberMasked,
        cardHolderName,
        expiryDate,
        totalLimit: Number(totalLimit) || 0,
        availableLimit: Number(totalLimit) || 0,
        outstandingAmount: 0,
        minimumDue: 0,
        dueDate,
        userId: session.user.id,
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

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating credit card:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
