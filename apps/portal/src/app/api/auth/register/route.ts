import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const ALLOWED_ORIGIN = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5173'
  : process.env.NEXT_PUBLIC_APP_URL;

// Helper function to add CORS headers
function corsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Handle OPTIONS requests (preflight)
export async function OPTIONS() {
  return corsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return corsHeaders(NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      ));
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return corsHeaders(NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      ));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return corsHeaders(NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
      },
    }));
  } catch (error: any) {
    console.log("[REGISTRATION_ERROR]", error);
    return corsHeaders(NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    ));
  }
} 