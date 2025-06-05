declare namespace Express {
  interface Request {
    id?: string;
    rawBody?: Buffer;
  }
} 