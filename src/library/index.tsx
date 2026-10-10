import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import { LibraryApp } from './app';

ReactDOM.render(
    <React.StrictMode>
        <LibraryApp />
    </React.StrictMode>,
    document.getElementById('library-root'),
);
