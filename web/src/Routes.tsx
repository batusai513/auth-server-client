import React from 'react';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import './App.css';
import { Home } from './pages/Home';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { Protected } from './pages/Protected';
import { Header } from './Header';

export function Routes() {
  return (
    <BrowserRouter>
      <>
        <Header />
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/register">
            <Register />
          </Route>
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/protected">
            <Protected />
          </Route>
        </Switch>
      </>
    </BrowserRouter>
  );
}
