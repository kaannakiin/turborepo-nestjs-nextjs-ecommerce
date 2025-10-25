import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class CsrfService {
  public generateCsrfToken: (req: Request, res: Response) => string;
}
