import React from 'react';
import { useByeQuery } from '../generated/graphql';

interface Props {}

export const Protected: React.FC<Props> = function Protected() {
  const { loading, data, error } = useByeQuery({ fetchPolicy: 'network-only' });
  if (loading) {
    return <div>loading</div>;
  }
  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }

  if (!data) {
    return <div>no data</div>;
  }
  return <div>worked, {JSON.stringify(data)}</div>;
};
