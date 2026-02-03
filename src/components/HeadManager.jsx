import { useEffect } from 'react';
import { applyMetaToDocument } from '../seo';

export function HeadManager({ meta }) {
  useEffect(() => {
    applyMetaToDocument(meta);
  }, [meta]);

  return null;
}

export default HeadManager;
