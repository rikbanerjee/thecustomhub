/**
 * Field-level diff between two product objects — powers the preview every
 * confirm step shows. Shallow on top-level keys, one level deep into
 * `marketplace` (the only nested object v0 tools mutate).
 */

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function shallowEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * @param {object} before
 * @param {object} after
 * @returns {Array<{field: string, before: unknown, after: unknown}>}
 */
export function diff(before, after) {
  const changes = [];
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);

  for (const key of keys) {
    const beforeVal = before?.[key];
    const afterVal = after?.[key];

    if (isPlainObject(beforeVal) || isPlainObject(afterVal)) {
      const nestedKeys = new Set([...Object.keys(beforeVal || {}), ...Object.keys(afterVal || {})]);
      for (const nestedKey of nestedKeys) {
        const nb = beforeVal?.[nestedKey];
        const na = afterVal?.[nestedKey];
        if (!shallowEqual(nb, na)) {
          changes.push({ field: `${key}.${nestedKey}`, before: nb, after: na });
        }
      }
      continue;
    }

    if (!shallowEqual(beforeVal, afterVal)) {
      changes.push({ field: key, before: beforeVal, after: afterVal });
    }
  }

  return changes;
}
