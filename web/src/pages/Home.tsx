import React from 'react';
import { useUsersQuery } from '../generated/graphql';

interface Props {}

export const Home: React.FC<Props> = function Home(props) {
  const { loading, data } = useUsersQuery({ fetchPolicy: 'network-only' });
  if (loading || !data) {
    return <div>loading</div>;
  }
  return (
    <div>
      {data.users.map((user) => {
        return <div key={user.id}>{user.email}</div>;
      })}
    </div>
  );
};
