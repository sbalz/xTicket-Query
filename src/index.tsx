import React from 'react';
import ReactDOM from 'react-dom';
import App from './App/App';
import {ThemeProvider, DEFAULT_THEME} from '@zendeskgarden/react-theming';
import './App/App.css';

// Get the root HTML element where the React app will be mounted
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root container not found');

// Render the React application inside the root element
ReactDOM.render(
    <React.StrictMode>
        {/* Apply Zendesk Garden theme to the app */}
        <ThemeProvider theme={DEFAULT_THEME}>
            <App /> {/* Main app component */}
        </ThemeProvider>
    </React.StrictMode>,
    rootElement,
);
