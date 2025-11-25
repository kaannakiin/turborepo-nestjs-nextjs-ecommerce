import { Injectable } from '@nestjs/common';
import { $Enums } from '@repo/database/client';

@Injectable()
export class PaytrService {
  constructor() {}
  private getPayTRToken({
    merchant_key,
    merchant_salt,
    merchant_id,
    user_ip,
    merchant_oid,
    email,
    payment_amount,
    payment_type,
    installment_count,
    currency,
    test_mode,
    non_3d,
  }: {
    merchant_key: string;
    merchant_salt: string;
    merchant_id: string;
    user_ip: string;
    merchant_oid: string;
    email: string;
    payment_amount: number;
    payment_type: 'card';
    installment_count: number;
    currency: $Enums.Currency;
    test_mode: 0 | 1;
    non_3d: 0 | 1;
  }) {
    const hashSTR = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${payment_type}${installment_count}${currency}${test_mode}${non_3d}`;
    const paytr_token = hashSTR + merchant_salt;
    const crypto = require('crypto');
    const token = crypto
      .createHmac('sha256', merchant_key)
      .update(paytr_token)
      .digest('base64');

    return token;
  }
}
