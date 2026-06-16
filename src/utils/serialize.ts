/**
 * Recursively converts BigInt fields to standard numbers or strings in objects/arrays,
 * resolving Next.js Server Action serialization limitations.
 */
export function serializeBigInt<T>(obj: T): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = serializeBigInt((obj as any)[key]);
      }
    }
    return newObj;
  }
  return obj;
}
