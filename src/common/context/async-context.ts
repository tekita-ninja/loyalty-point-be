import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  userId: string;
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();
