import { deepEquals } from "bun";
import {MaObject} from "./ma";

export function identityEquals(a: MaObject, b: MaObject): boolean {
  return a.id === b.id;
}

/**
 * Implements the personality equality operator (=p=) and parametric personality equality operator (=p[x]=)
 * @param a First object to compare
 * @param b Second object to compare
 * @param claims Optional array of specific claims to compare. If omitted, compares total personality
 */
export function personalityEquals(a: MaObject, b: MaObject, claims?: string[]): boolean {
  if (!identityEquals(a, b)) return false;
  if (!(a instanceof MaObject) || !(b instanceof MaObject)) return false;
    
  // If checking total personality, check all claims
  if (claims == null) claims = a.getClaimNames();
  
  // For parametric personality equality, ONLY check the specified claims
  return claims.every(claim => 
    deepEquals(a.get(claim), b.get(claim))
  );
}