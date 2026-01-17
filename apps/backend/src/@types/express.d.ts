import { Locale } from '@repo/database';

declare global {
  namespace Express {
    interface Request {
      STORE_TYPE?: string;
      localization?: Locale;
      cart_id?: string;
    }
  }
}
