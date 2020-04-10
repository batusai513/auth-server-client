import React from 'react';
import { useLoginMutation, MeDocument, MeQuery } from '../generated/graphql';
import { useHistory } from 'react-router-dom';
import { setAccessToken } from '../accessToken';

interface Props {}

export const Login: React.FC<Props> = function Login() {
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const history = useHistory();

  const [login, { loading }] = useLoginMutation();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        login({
          variables: { email, password },
          update: (cache, { data }) => {
            if (!data) {
              return null;
            }
            cache.writeQuery<MeQuery>({
              query: MeDocument,
              data: {
                __typename: "Query",
                me: data.login.user,
              },
            });
          },
        })
          .then((response) => {
            setAccessToken(response?.data?.login.accessToken ?? '');
            history.replace('/');
          })
          .catch((e) => console.error(e));
      }}>
      <div>
        <input
          type="email"
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <input
          type="password"
          name="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <button type="submit" disabled={loading}>
          Login
        </button>
      </div>
    </form>
  );
};
