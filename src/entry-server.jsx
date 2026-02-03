import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { matchRoutes } from 'react-router-dom';
import App from './App.jsx';
import routes from './routes.jsx';
import { buildHeadTags } from './seo';

export function render(url) {
  const matches = matchRoutes(routes, url);
  const lastMatch = matches?.[matches.length - 1];
  const fallbackMeta = routes.find((route) => route.path === '*')?.meta || {};
  const matchedMeta = lastMatch?.route?.meta || fallbackMeta;
  const isNotFound = !matches || lastMatch?.route?.path === '*';

  const appHtml = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );

  const head = buildHeadTags(matchedMeta || {});

  return {
    html: appHtml,
    head,
    status: isNotFound ? 404 : 200
  };
}
