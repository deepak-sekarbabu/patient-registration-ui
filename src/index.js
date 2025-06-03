import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (process.env.NODE_ENV === 'development') {
  import('@stagewise/toolbar-react')
    .then(({ StagewiseToolbar }) => {
      const stagewiseConfig = {
        plugins: [],
      };

      // Create a dedicated div for the toolbar
      const toolbarRootElement = document.createElement('div');
      document.body.appendChild(toolbarRootElement);

      // Create a new root for the toolbar
      const toolbarRoot = ReactDOM.createRoot(toolbarRootElement);

      // Render the toolbar component
      toolbarRoot.render(<StagewiseToolbar config={stagewiseConfig} />);
    })
    .catch((err) => {
      console.error('Failed to load Stagewise Toolbar:', err);
    });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
