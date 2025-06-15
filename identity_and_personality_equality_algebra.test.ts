import { describe, test, expect, beforeEach } from 'bun:test';
import { Ma } from './ma';
import {identityEquals, personalityEquals} from "./equality";

`
This test suite aims to prove that the identity and personality algebra for
the ma framework is implemented correctly and comprehensively.

# Operators Legend
=id=     Identity equality operator
=p=      Total personality equality operator
=p[x]=   Parametric personality equality operator (for claim(s) x)
≠p=      Personality inequality operator
≠p[x]=   Parametric personality inequality operator
=>       Logical implication
&&       Logical AND
!        Logical NOT
'        Change marker (indicates a changed state)
[x']     Changed claim marker (indicates a change in specific claim x)
[x,y]    Multiple claim specification
.        Property access operator
;        Claim definition operator
{}       Scope operator (groups related definitions/axioms)
//       Comment

# Identity axioms (as established)
a =id= b => false       // Different things are never identical
b =id= a => false       // Same as above, but proves commutative property
a =id= a => true        // Something is identical to itself

# Basic personality axioms (as established)
a  =p= a  => true            // Something has same total personality as itself (if unchanged)
a  =p= a' => false           // Something differs from changed self
a' =p= a && a =p= a'=> false // Personality changes are symmetric
a  =p= b  => false           // Different identities never share total personality

# Parametric personality axioms
a =p[c]=   a     => true     // A claim is equal to itself if unchanged
a =p[c]=   a[c'] => false    // If a's c claim changed, no longer equal
a =p[c]=   a[d'] => true     // If a's d claim changed, c personality is still equal to changed a
a =p[d]=   a[c'] => true     // same as above, different changes in claims
a =p[c,d]= a     => true     // true, claim is equal to itself if unchanged
b =p[c]=   b     => true     // Same claim equality for different identity
a =p[c]=   b[c]  => false    // Even if two different objects have same value for claim c

# Undefined claims personality equality axioms
## It is important to note that it is a CHOICE 
## to say that undefined claims are considered equal
## because our equality operators are meant to track changes over time
{
a.b;a.c;
a =p[d]= a     => true    // An undefined claim remains true to itself.
a =p[c]= b     => false   // different identities still not equal even with same undefined claim
a.c;                      // now a defines c
a =p[c]= a'    => true    // claim starts tracking after definition
a.c';                     // c changes
a =p[c]= a[c'] => false   // The changes to c are tracked

# Multiple claim parameters
a =p[c,d]= a  => true       // Multiple unchanged claims are equal
a =p[c,d]= a' => false      // If ANY specified claim changes, no longer equal
a =p[c]=   b  => false      // Different identities never equal, even for same claim value
# Subset relationships
a =p=      a => a =p[c]= a  // Total personality equality implies specific claim equality
a =p[c,d]= a => a =p[c]= a  // More claims implies fewer claims equality (if true)

# Transitivity with conditions
a =p[c]= a &&   a =id= a  => a =p[c]= a  // Identity and specific claim equality compose
a =p[c]= b && !(a =id= b) => false       // Different identities force false, even with same claim

# Change propagation
a =p[c]=   a && a' ≠p[c]= a => a' ≠p=      a  // Change in specific claim affects total personality
a =p[c,d]= a && a' ≠p[c]= a => a' ≠p[c,d]= a  // Change in one claim affects compound claims
`

async function snapshot(ma: Ma, obj: MaObject): Promise<MaObject> {
  const copy = await ma.createObject(I => {
    // Copy all claims from original object
    obj.getClaimNames().forEach(claim => {
      I.claim(claim, obj.get(claim));
    });
  });
  
  // Force same identity
  copy._____overrideIdentity(obj.id);
  return copy;
}

describe(`
# Ma identity and personality axioms test suite :)

`, () => {
  let ma: Ma;

  beforeEach(() => {
    ma = new Ma();
    ma.run();
  });

  describe(`
  # Ma Identity Axioms

  a =id= b => false // Different objects are never identical
  b =id= a => false // Same as above, but proves commutative property
  a =id= a => true  // Object is identical to itself`, () => {

    test(`a =id= b => false // Different things are never identical`, async () => {
      const a = await ma.createObject(I => I.am('Object A'));
      const b = await ma.createObject(I => I.am('Object B'));
      expect(identityEquals(a, b)).toBe(false);
    });

    test(`b =id= a => false // Identity inequality is commutative`, async () => {
      const a = await ma.createObject(I => I.am('Object A'));
      const b = await ma.createObject(I => I.am('Object B'));

      expect(identityEquals(a, b)).toBe(false);
      expect(identityEquals(b, a)).toBe(false);
    });

    test(`a =id= a => true // Object is identical to itself`, async () => {
      const a = await ma.createObject(I => I.am('Object A'));

      expect(identityEquals(a, a)).toBe(true);
    });

    test(`a =id= a' => true // Identity persists through state changes`, async () => {
      const a = await ma.createObject(I => {
        I.am('Object A');
        I.claim('state', 'initial');
      });

      expect(identityEquals(a, a)).toBe(true);
      a.claim('state', 'changed');
      expect(identityEquals(a, a)).toBe(true);
    });

    test(`(a =id= b => false) &&
          (b =id= c => false) =>
            (a =id= c => false) // Identity inequality is transitive`, async () => {
      const [a, b, c] = await Promise.all([
        ma.createObject(I => I.am('Object 1')),
        ma.createObject(I => I.am('Object 2')),
        ma.createObject(I => I.am('Object 3'))
      ]);

      // Prove that all pairs are non-identical
      expect(identityEquals(a, b)).toBe(false);
      expect(identityEquals(a, c)).toBe(false);
      expect(identityEquals(b, c)).toBe(false);

      // Prove symmetry of non-identity
      expect(identityEquals(b, a)).toBe(false);
      expect(identityEquals(c, a)).toBe(false);
      expect(identityEquals(c, b)).toBe(false);
    });
  });

  describe(`
  # Basic personality axioms

  a  =p= a  => true       // Something has same total personality as itself (if unchanged)
  a  =p= a' => false      // Something differs from changed self
  a' =p= a  => false      // Personality changes are symmetric
  a  =p= b  => false      // Different identities never share total personality`, () => {

    test(`a =p= a => true // Something has same total personality as itself if unchanged`, async () => {
      const a = await ma.createObject(I => {
        I.am('Object A');
        I.claim('state', 'initial');
      });

      expect(personalityEquals(a, a)).toBe(true);
    });

    test(`a =p= a' => false // Something differs from its changed self`, async () => {
      const a = await ma.createObject(I => {
        I.am('Object A');
        I.claim('state', 'initial');
      });
      
      const aSnapshot = await snapshot(ma, a);
      a.claim('state', 'changed');
      
      expect(personalityEquals(a, aSnapshot)).toBe(false);
    });

    test(`a' =p= a && a =p= a' => false // Personality changes are symmetric`, async () => {
        const a = await ma.createObject(I => {
          I.am('Object A');
          I.claim('state', 'initial');
        });
        
        const aSnapshot = await snapshot(ma, a);
        a.claim('state', 'changed');
        
        expect(personalityEquals(a, aSnapshot)).toBe(false);
        expect(personalityEquals(aSnapshot, a)).toBe(false);
      });

    test(`a =p= b => false // Different identities never share total personality`, async () => {
      const a = await ma.createObject(I => {
        I.am('Object A');
        I.claim('state', 'same');
      });

      const b = await ma.createObject(I => {
        I.am('Object B');
        I.claim('state', 'same');
      });

      expect(personalityEquals(a, b)).toBe(false);
    });
  });

  describe(`
  # Parametric personality axioms

  a =p[c]=   a     => true     // A claim is equal to itself if unchanged
  a =p[c]=   a[c'] => false    // If a's c claim changed, no longer equal  
  a =p[c]=   a[d'] => true     // If a's d claim changed, c personality is still equal to changed a
  a =p[d]=   a[c'] => true     // same as above, different changes in claims
  a =p[c,d]= a     => true     // true, claim is equal to itself if unchanged
  b =p[c]=   b     => true     // Same claim equality for different identity
  a =p[c]=   b[c]  => false    // Even if two different objects have same value for claim c`, () => {

   test(`a =p[c]= a => true // A claim is equal to itself if unchanged`, async () => {
     const a = await ma.createObject(I => {
       I.am('Object A');
       I.claim('c', 'some value');
     });

     expect(personalityEquals(a, a, ['c'])).toBe(true);
   });

   test(`a =p[c]= a[c'] => false // If a's c claim changed, no longer equal`, async () => {
     const a = await ma.createObject(I => {
       I.am('Object A');
       I.claim('c', 'initial value');
     });

     const aSnapshot = await snapshot(ma, a);
     a.claim('c', 'changed value');

     expect(personalityEquals(a, aSnapshot, ['c'])).toBe(false);
   });

   test(`a =p[c]= a[d'] => true // If a's d claim changed, c personality is still equal to changed a`, async () => {
     const a = await ma.createObject(I => {
       I.am('Object A');
       I.claim('c', 'constant value');
       I.claim('d', 'initial value');
     });

     const aSnapshot = await snapshot(ma, a);
     a.claim('d', 'changed value');

     console.log(a.get('c'), aSnapshot.get('c'));

     expect(personalityEquals(a, aSnapshot, ['c'])).toBe(true);
   });

   test(`a =p[d]= a[c'] => true // Different claim changes don't affect other claims`, async () => {
     const a = await ma.createObject(I => {
       I.am('Object A');
       I.claim('c', 'initial value');
       I.claim('d', 'constant value');
     });

     const aSnapshot = await snapshot(ma, a);
     a.claim('c', 'changed value');

     expect(personalityEquals(a, aSnapshot, ['d'])).toBe(true);
   });

   test(`a =p[c,d]= a => true // Multiple unchanged claims are equal`, async () => {
     const a = await ma.createObject(I => {
       I.am('Object A');
       I.claim('c', 'value c');
       I.claim('d', 'value d');
     });

     expect(personalityEquals(a, a, ['c', 'd'])).toBe(true);
   });

   test(`b =p[c]= b => true // Same claim equality for different identity`, async () => {
     const b = await ma.createObject(I => {
       I.am('Object B');
       I.claim('c', 'some value');
     });

     expect(personalityEquals(b, b, ['c'])).toBe(true);
   });

   test(`a =p[c]= b[c] => false // Different identities never equal, even with same claim value`, async () => {
     const a = await ma.createObject(I => {
       I.am('Object A');
       I.claim('c', 'same value');
     });

     const b = await ma.createObject(I => {
       I.am('Object B');
       I.claim('c', 'same value');
     });

     expect(personalityEquals(a, b, ['c'])).toBe(false);
   });
  });
});
