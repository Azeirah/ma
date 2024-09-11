import {Ma, MaObject} from "./ma.ts";

const ma = new Ma();

ma.run();

ma.createObject((I, runtime) => {
  I.claim('color', 'red');
  I.handleWish(
    wish => "newColor" in wish, 
    (me, wish) => me.claim("color", wish['newColor'])
  );
});

ma.createObject((I, runtime) => {
  I.wish(
    it => it.claims.has('color'),
    { newColor: 'blue' }
  );

  runtime.when(
    it => it.claims.has('color'),
    it => console.log(`${it.id} is ${it.claims.get('color')}`)
  );
});