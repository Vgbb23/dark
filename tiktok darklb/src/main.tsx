import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { TrackingParamsProvider } from './TrackingParamsContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TrackingParamsProvider>
      <App />
    </TrackingParamsProvider>
  </StrictMode>,
);
