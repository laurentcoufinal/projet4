export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
}

export interface TokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
