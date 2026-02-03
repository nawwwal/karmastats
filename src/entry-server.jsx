import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { matchRoutes } from 'react-router-dom';
import App from './App.jsx';
import routes from './routes.jsx';

export function render(url) {
  const helmetContext = {};
  const matches = matchRoutes(routes, url);
  const lastMatch = matches?.[matches.length - 1];
  const isNotFound = !matches || lastMatch?.route?.path === '*';

  const appHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </HelmetProvider>
  );

  const { helmet } = helmetContext;
  const head = [
    helmet?.title?.toString?.() || '',
    helmet?.meta?.toString?.() || '',
    helmet?.link?.toString?.() || '',
    helmet?.script?.toString?.() || ''
  ].join('');

  return {
    html: appHtml,
    head,
    status: isNotFound ? 404 : 200
  };
}
