import { NotFoundException } from "@nestjs/common";

export async function checkDataById<T>(
  id: string,
  modelDelegate: { findUnique: (args: any) => Promise<T | null> }
): Promise<T> {
  const response = await modelDelegate.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!response) {
    throw new NotFoundException('data not found!');
  }
  return response;
}