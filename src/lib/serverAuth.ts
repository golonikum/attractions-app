import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User as PrismaUser } from "@prisma/client";
import { User } from "@/types/user";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: PrismaUser): string {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User;
  } catch (error) {
    return null;
  }
}

export async function getTokenFromCookie() {
  const token = (await cookies()).get("token")?.value;
  return token;
}

export async function verifyTokenFromCookie() {
  const token = await getTokenFromCookie();
  if (!token) return null;

  try {
    return verifyToken(token);
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

export const getUserId = (request: NextRequest) => {
  let error;

  // Verify authentication token
  const token = request.cookies.get("token")?.value;
  if (!token) {
    error = NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const decoded = token ? verifyToken(token) : null;
  if (!decoded || !decoded.id) {
    error = NextResponse.json(
      { error: "Недействительный токен" },
      { status: 401 },
    );
  }

  return { error, userId: decoded?.id };
};

export const withAuth = async (
  request: NextRequest,
  cb: (userId: string) => Promise<NextResponse>,
) => {
  try {
    const { error, userId } = getUserId(request);
    if (error) {
      return error;
    }

    return await cb(userId!);
  } catch (error) {
    console.error("Error doing request to DB:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
};
