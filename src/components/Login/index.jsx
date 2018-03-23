import React from 'react';
import './Login.css';

export default (props) => (
  <div className='Login'>
    <button onClick={props.onSignIn}>sign in</button>
    <button onClick={props.onSignOut}>cancel</button>
  </div>
);
