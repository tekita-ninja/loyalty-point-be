import { NotFoundException } from "@nestjs/common";

export async function checkDataById<T extends { id: string }>(
  id: string,
  modelDelegate: { findUnique: (args: any) => Promise<T | null> },
  type?: string
): Promise<T> {
  const response = await modelDelegate.findUnique({
    where: { id },
    select: { id: true },
  });


  if (!response) {
    throw new NotFoundException(`${type} data not found!`);
  }
  return response;
}