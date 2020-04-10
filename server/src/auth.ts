import { User } from './entity/User';
import { sign } from 'jsonwebtoken';
import { Response } from 'express';

export function createAccessToken(user: User) {
  return sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: '5m',
  });
}

export function createRefreshToken(user: User) {
  return sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: '7d',
    }
  );
}

export function sendRefreshToken(res: Response, token: string): void {
  res.cookie('jid', token, {
    httpOnly: true,
    path: '/refresh_token',
  });
}

// revoke token strategy

/*
 we can have whitelist/blacklist to revoke old tokens
 but in here we are going to use a version strategy
 the version is stored in the user model
*/
