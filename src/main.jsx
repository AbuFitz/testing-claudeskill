import { createRoot } from 'react-dom/client';
import '@fontsource-variable/big-shoulders-display/wght';
import '@fontsource/instrument-sans/latin-400.css';
import '@fontsource/instrument-sans/latin-600.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import './styles/base.css';
import './styles/sections.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
