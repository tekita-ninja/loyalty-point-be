import { NotFoundException } from '@nestjs/common';

export async function checkDataById<T extends { id: string }>(
  id: string,
  modelDelegate: { findUnique: (args: any) => Promise<T | null> },
  type?: string,
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

export async function checkDataByIds<T extends { id: string }>(
  ids: string[],
  modelDelegate: { findMany: (args: any) => Promise<T[]> },
  type = 'Data',
): Promise<void> {
  const records = await modelDelegate.findMany({
    where: {
      AND: [{ id: { in: ids } }],
    },
    select: { id: true },
  });

  const foundIds = records.map((record) => record.id);
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  if (notFoundIds.length > 0) {
    throw new NotFoundException(
      `${type} not found for ID(s): ${notFoundIds.join(', ')}`,
    );
  }
}
