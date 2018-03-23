import React, { Component } from 'react';
import Login from '../Login';
import logo from '../../common/assets/img/logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <Login onSignIn={signIn} onSignOut={signOut} />
      </div>
    );
  }
}

function signIn() {
  console.log('sign in');
}

function signOut() {
  console.log('sign out');
}

export default App;
