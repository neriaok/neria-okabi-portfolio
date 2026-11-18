import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import '@fontsource/anton/latin-400.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import '@fontsource/karantina/hebrew-700.css';
import '@fontsource/frank-ruhl-libre/hebrew-400.css';
import '@fontsource/frank-ruhl-libre/hebrew-500.css';
import '@fontsource/heebo/hebrew-400.css';
import '@fontsource/heebo/hebrew-500.css';
import '@fontsource/heebo/hebrew-600.css';
import './styles/global.css';
import App from './App';
import { store } from './store/store';

console.log(
  `%c
   _  _  ___
  | \\| |/ _ \\   hey, fellow dev 👋
  | .\` | (_) |  you found the console.
  |_|\\_|\\___/   press \` anywhere to open the terminal.
`,
  'color:#c6e877;font-family:monospace;font-size:12px',
);

createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
