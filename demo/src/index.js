import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import JssProvider from 'react-jss/lib/JssProvider';
import { create } from 'jss';
import { createGenerateClassName, jssPreset } from '@material-ui/core/styles';

const generateClassName = createGenerateClassName();
const jss = create({
    ...jssPreset(),
    insertionPoint: document.getElementById('jss-insertion-point'),
});

ReactDOM.render(
    <JssProvider jss={ jss } generateClassName={ generateClassName }>
        <App />
    </JssProvider>,
    document.getElementById('root')
);
