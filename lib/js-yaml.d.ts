declare module "js-yaml" {
  /** JSON-compatible YAML scalars and containers; no executable custom tags. */
  export const JSON_SCHEMA: object;
  export function load(source: string, options: { schema: object }): unknown;
  export function dump(value: unknown, options?: {
    schema?: object;
    noRefs?: boolean;
    lineWidth?: number;
    sortKeys?: boolean;
  }): string;
}
