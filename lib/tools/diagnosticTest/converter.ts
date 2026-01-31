import { coerceValues as sharedCoerce } from '@/lib/tools/shared/coerce';
import type { CoercedValues, RawValues } from './types';

export function coerceValues(raw: RawValues): CoercedValues {
  return sharedCoerce(raw);
}

export default coerceValues;


