import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteMeta } from '../routeMeta.js';
import { applyMetaToDocument } from '../seo.js';

export function HeadManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    applyMetaToDocument(getRouteMeta(pathname));
  }, [pathname]);

  return null;
}
