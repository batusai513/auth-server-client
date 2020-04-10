import React from 'react';
import { useRegisterMutation } from '../generated/graphql';
import { useHistory } from 'react-router-dom';

interface Props {}

export const Register: React.FC<Props> = function Register() {
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const history = useHistory();

  const [register] = useRegisterMutation();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.warn(email, password);
        register({ variables: { email, password } }).then((res) => {
          history.push('/');
        });
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
        <button type="submit">Register</button>
      </div>
    </form>
  );
};
