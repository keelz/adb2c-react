import React, { Component } from 'react';
import { signIn } from '../../common/utils/adb2c';
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

function signOut() {
  console.log('sign out');
}

export default App;
