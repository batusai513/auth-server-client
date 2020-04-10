import { MiddlewareFn } from 'type-graphql';
import { MyContext } from './MyContext';
import { verify } from 'jsonwebtoken';
import { AuthenticationError } from 'apollo-server-express';

export const isAuth: MiddlewareFn<MyContext> = (action, next) => {
  const { context } = action;
  const authorization = context.req.headers['authorization'];
  console.warn(authorization);
  if (!authorization) {
    throw new AuthenticationError('not authenticated');
  }
  try {
    const token = authorization?.split(' ')[1];
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
    context.payload = payload as any;
  } catch (error) {
    console.error(error);
    throw new AuthenticationError('not authenticated');
  }
  return next();
};
