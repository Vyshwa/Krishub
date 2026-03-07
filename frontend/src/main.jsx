import ReactDOM from 'react-dom/client';
import './setup/consoleSilencer';
import { ThemeProvider } from 'next-themes';
import { initEditor } from './hooks/useEditor';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initEditor());
} else {
  initEditor();
}

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" attribute="class">
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);
