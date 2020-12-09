import 'modern-normalize/modern-normalize.css';
import './misc/i18n';

import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';

import Root from './components/Root';
import * as swRegistration from './swRegistration';

const rootEl = document.getElementById('app');

Modal.setAppElement(rootEl);

const root = ReactDOM.unstable_createRoot(rootEl);
root.render(<Root />);

swRegistration.register();

// eslint-disable-next-line no-console
console.log('Checkout the repo: https://github.com/haishanh/yacd');
// eslint-disable-next-line
console.log('Version:', __VERSION__);
