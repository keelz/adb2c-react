import React from 'react';
import ReactDOM from 'react-dom';
import Adal from './common/utils/adb2c';
import './index.css';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

Adal.init();

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
