import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import { LibraryApp } from './app';
import { applyLibraryTheme, readLibraryTheme } from './theme';

// Resolve once, before React commits any Library content. Startup never writes storage.
const initialTheme = readLibraryTheme();
applyLibraryTheme(initialTheme);

ReactDOM.render(
    <React.StrictMode>
        <LibraryApp initialTheme={initialTheme} />
    </React.StrictMode>,
    document.getElementById('library-root'),
);
