import { useRoutes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PageLoader } from './components/common';
import { routes } from './routes';
import './styles/global.css';

function App() {
  const routing = useRoutes(routes);

  return (
    <ThemeProvider>
      <PageLoader minDuration={1000} />
      {routing}
    </ThemeProvider>
  );
}

export default App;
