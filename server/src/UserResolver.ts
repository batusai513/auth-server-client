import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
  UseMiddleware,
  Int,
} from 'type-graphql';
import { hash, compare } from 'bcrypt';
import { User } from './entity/User';
import { MyContext } from './MyContext';
import {
  createRefreshToken,
  createAccessToken,
  sendRefreshToken,
} from './auth';
import { AuthenticationError } from 'apollo-server-express';
import { isAuth } from './isAuth';
import { getConnection } from 'typeorm';
import { verify } from 'jsonwebtoken';

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: String;
  @Field(() => User)
  user: User;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return 'Hola mundo';
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  bye() {
    return 'Bye';
  }

  @Query(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  me(@Ctx() context: MyContext) {
    const { req } = context;
    const authorization = req.headers['authorization'];
    if (!authorization) {
      return null;
    }
    try {
      const token = authorization?.split(' ')[1];
      const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
      return User.findOne(payload.userId);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  //used for testing purposes
  // in real life, better create a function that update the
  // tokenVersion and call it after forget password
  @Mutation(() => Boolean)
  async revokeRefreshTokenForUser(@Arg('userId', () => Int) userId: number) {
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, 'tokenVersion', 1);

    return true;
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() {res}: MyContext) {
    sendRefreshToken(res, '');
    res.clearCookie('jid');
    return true;
  }

  @Mutation(() => Boolean)
  async register(
    @Arg('email', () => String) email: string,
    @Arg('password') password: string
  ) {
    const hashedPassword = await hash(password, 12);

    try {
      await User.insert({
        email,
        password: hashedPassword,
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('email', () => String) email: string,
    @Arg('password') password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new AuthenticationError('user not found');
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      throw new AuthenticationError('not valid credentials');
    }

    sendRefreshToken(res, createRefreshToken(user));

    return {
      accessToken: createAccessToken(user),
      user,
    };
  }
}
