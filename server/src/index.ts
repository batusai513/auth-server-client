import 'dotenv/config';
import 'reflect-metadata';
import Express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './UserResolver';
import { createConnection } from 'typeorm';
import cookieParser from 'cookie-parser';
import { verify } from 'jsonwebtoken';
import cors from 'cors';
import { User } from './entity/User';
import {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} from './auth';
// import { User } from './entity/User';

(async function () {
  const app = Express();
  app.use(cookieParser());
  app.use(
    cors({
      credentials: true,
      origin: 'http://localhost:3000',
    })
  );

  app.get('/', (_, res) => {
    res.send('hello');
  });

  app.post('/refresh_token', async (req, res) => {
    const token = req.cookies.jid;
    if (!token) {
      return res.sendStatus(401).send('Forbidden');
    }

    let payload = null;

    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!) as any;
    } catch (error) {
      console.error(error);
      res.sendStatus(401).send('Not authorized');
      return false;
    }

    //token valid, send access token
    const user = await User.findOne({ id: payload.userId });

    if (!user) {
      return res.sendStatus(401).send('Forbidden');
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.sendStatus(401).send('Forbidden');
    }

    sendRefreshToken(res, createRefreshToken(user));
    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });

  await createConnection();

  const schema = await buildSchema({
    resolvers: [UserResolver],
  });

  const apolloServer = new ApolloServer({
    schema,
    context: ({ res, req }) => ({
      res,
      req,
    }),
    debug: true,
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.warn('Server started 🚀 😎');
  });
})();

// createConnection().then(async connection => {

//     console.log("Inserting a new user into the database...");
//     const user = new User();
//     user.firstName = "Timber";
//     user.lastName = "Saw";
//     user.age = 25;
//     await connection.manager.save(user);
//     console.log("Saved a new user with id: " + user.id);

//     console.log("Loading users from the database...");
//     const users = await connection.manager.find(User);
//     console.log("Loaded users: ", users);

//     console.log("Here you can setup and run express/koa/any other framework.");

// }).catch(error => console.log(error));
