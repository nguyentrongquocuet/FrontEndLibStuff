type TClassName =
	| string
	| undefined
	| null
	| Array<TClassName>
	| Record<string, boolean>;

/**
 * vue-style class-name parser
 */
// eslint-disable-next-line max-len
export function parseClassNames(
  c: TClassName | Array<TClassName> | Record<string, boolean>,
): string {
  if (typeof c === 'undefined') return '';
  if (c === null) return '';
  if (typeof c === 'string') return c.trim();
  if (Array.isArray(c)) {
    return c
      .map(parseClassNames)
      .filter((cs) => !!cs)
      .join(' ');
  }
  return parseClassNames(Object.keys(c).filter((key) => !!c[key]));
}
