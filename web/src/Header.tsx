import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useMeQuery, useLogoutMutation } from './generated/graphql';
import { setAccessToken } from './accessToken';

export const Header: React.FC<{}> = function Header() {
  const [logout, { client }] = useLogoutMutation();
  const [loggedin, setLoggedin] = useState<boolean>(false);
  const { data, error } = useMeQuery({
    fetchPolicy: 'network-only',
    skip: !loggedin,
  });

  const history = useHistory();

  return (
    <header>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li>
          <Link to="/register">Register</Link>
        </li>
        <li>
          <Link to="/protected">Protected</Link>
        </li>
      </ul>
      {data && data.me && !error ? (
        <>
          <div>toy are logged in as {data.me.email}</div>
          <br />
          <button
            onClick={() => {
              logout().then(() => {
                setAccessToken('');
                client!.resetStore().then(() => {
                  client!.writeData({ data: {} });
                  history.push('/');
                });
              });
            }}>
            logout
          </button>
        </>
      ) : null}
    </header>
  );
};
