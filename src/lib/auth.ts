import { prisma } from "./db";
import bcrypt from "bcryptjs";

export type UserRole = "school" | "admin";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  schoolId?: string;
  approved: boolean;
}

// bcrypt has a 72-byte limit; truncate to avoid "password cannot be longer than 72 bytes"
function toSafePassword(input: string): string {
  if (typeof input !== "string") return "";
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  if (bytes.length <= 72) return input;
  return new TextDecoder().decode(bytes.slice(0, 72));
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(toSafePassword(password), 12);
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(toSafePassword(password), hashed);
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { school: true },
  });
}
