import { describe, test, expect, beforeEach } from 'vitest';
import { Ma } from './ma';

/**
 * Waits for a condition to be met, respecting Ma's 2Hz tick rate.
 * Will retry for at most 3 ticks before giving up.
 * 
 * @param testFn - Function that returns a test scenario
 * @returns Promise that resolves when condition is met or rejects after max retries
 */
export async function chill(testFn: () => void | Promise<void>): Promise<void> {
  const TICK_DURATION_MS = 500; // 2Hz = 500ms per tick
  const MAX_RETRIES = 3;
  
  for (let i = 0; i < MAX_RETRIES - 1; i++) {
    try {
      const result = await testFn();
      if (result) {
        return;
      }
    } catch (e) {}
    
    await new Promise(resolve => setTimeout(resolve, TICK_DURATION_MS));
  }
  
  await testFn();
}

describe('Ma Object Independence Tests', () => {
  let ma: Ma;

  beforeEach(() => {
    ma = new Ma();
    ma.run();
  });

  test('Independent Claim Management', async () => {
    const objectA = await ma.createObject(I => {
      I.am('Object A');
    });

    const objectB = await ma.createObject(I => {
      I.am('Object B');
    });

    await objectA.claim('name', 'A');
    await objectB.claim('name', 'B');

    const nameA = await objectA.get('name');
    const nameB = await objectB.get('name');

    expect(nameA).toBe('A');
    expect(nameB).toBe('B');
  });

  test('Independent Handling of Wishes', async () => {
    const octopus = await ma.createObject(I => {
      I.am('A color-changing octopus!');
      I.claim("color", "red");

      I.handleWish(
        wish => wish.command === 'changeColor',
        (me, wish) => me.claim('color', wish.newColor)
      );
    });

    const toggleButton = await ma.createObject(I => {
      I.am('A toggle button!');
      I.claim('state', false);

      I.handleWish(
        wish => wish.command === 'toggle',
        async (me, wish) => await me.claim('state', !this.get('state'))
      );
    });

    octopus.wish({ command: 'changeColor', newColor: 'blue' });
    toggleButton.wish({ command: 'toggleState' });

    const octopusColor = await octopus.get('color');
    const toggleButtonState = await toggleButton.get('state');

    chill(() => expect(octopusColor).toBe('red'));
    chill(() => expect(toggleButtonState).toBe(true));
  });

  test('Isolation of Handlers Across Objects', async () => {
    const objectA = await ma.createObject(I => {
      I.am('Object A');
      I.handleWish(
        wish => wish.operation === 'increment',
        (me, wish) => me.updateClaim('value', prev => prev + wish.amount)
      );
    });

    const objectB = await ma.createObject(I => {
      I.am('Object B');
      I.handleWish(
        wish => wish.operation === 'decrement',
        (me, wish) => me.updateClaim('value', prev => prev - wish.amount)
      );
    });

    await objectA.claim('value', 0);
    await objectB.claim('value', 0);

    await objectA.wish({ operation: 'increment', amount: 5 });
    await objectB.wish({ operation: 'decrement', amount: 3 });

    const valueA = await objectA.get('value');
    const valueB = await objectB.get('value');

    chill(() => expect(valueA).toBe(5));
    chill(() => expect(valueB).toBe(-3));
  });
});
