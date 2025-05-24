import { Prisma } from '@prisma/client';
import { softDeleteModels } from './soft-delete-model-list';
import { asyncLocalStorage } from 'src/common/context/async-context';

export function useMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    const store = asyncLocalStorage.getStore();
    const userId = store?.userId;
    if (
      softDeleteModels.includes(params.model!) &&
      ['findUnique', 'findFirst', 'findMany', 'count'].includes(params.action)
    ) {
      if (!params.args) {
        params.args = {};
      }

      if (!params.args.where) {
        params.args.where = {};
      }
      params.args.where.deletedAt = null;
    }

    // Intercept delete actions
    if (
      softDeleteModels.includes(params.model!) &&
      params.action === 'delete'
    ) {
      params.action = 'update';
      params.args.data = {
        deletedAt: new Date(),
        deletedBy: userId,
      };
    }

    // Intercept deleteMany actions
    if (
      softDeleteModels.includes(params.model!) &&
      params.action === 'deleteMany'
    ) {
      params.action = 'updateMany';
      params.args.data = {
        deletedAt: new Date(),
        deletedBy: userId,
      };
    }

    if (
      softDeleteModels.includes(params.model!) &&
      ['update', 'updateMany'].includes(params.action)
    ) {
      params.args.data = {
        ...params.args.data,
        updatedBy: userId,
      };
    }
    if (
      softDeleteModels.includes(params.model!) &&
      ['create', 'createMany'].includes(params.action)
    ) {
      params.args.data = {
        ...params.args.data,
        createdBy: userId,
      };
    }

    return next(params);
  };
}
