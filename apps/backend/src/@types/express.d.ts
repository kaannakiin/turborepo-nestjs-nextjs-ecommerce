import { Locale } from '@repo/database';

declare global {
  namespace Express {
    interface Request {
      storeId: string;
      locale: Locale;
    }
  }
}
