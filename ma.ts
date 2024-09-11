function genHexString(len) {
    const hex = '0123456789ABCDEF';
    let output = '';
    for (let i = 0; i < len; ++i) {
        output += hex.charAt(Math.floor(Math.random() * hex.length));
    }
    return output;
}

export class MaObject {
  constructor(id, runtime) {
    this.id = id;
    this.claims = new Map();
    this.wishHandlers = new Map();
    this.runtime = runtime;
  }

  claim(key, value) {
    this.claims.set(key, value);
  }

  handleWish(patternFn, handler) {
    this.wishHandlers.set(patternFn, {patternFn, handler});
  }

  receiveWish(sender, wish) {
    this.wishHandlers.forEach(({patternFn, handler}) => {
      if (patternFn(wish)) {
        console.log(`${this.id} received a wish from ${sender.id}`);
        handler(this, wish);
      }
    });
  }

  wish(patternFn, wish, data) {
    this.runtime.broadcastWish(this, patternFn, wish, data);
  }
}

export class Ma {
  constructor() {
    this.objects = new Map();
    this.whens = [];
    this.wishQueue = [];
  }

  createObject(program=Function.prototype) {
    const id = genHexString(16);
    const obj = new MaObject(id, this);
    this.objects.set(id, obj);
    program(obj, this);
    return obj;
  }

  when(condition, action) {
    this.whens.push({ condition, action });
  }

  broadcastWish(sender, patternFn, wish) {
    this.wishQueue.push({sender, patternFn, wish});
  }

  evaluateWishes() {
    while (this.wishQueue.length) {
      const {sender, patternFn, wish} = this.wishQueue.pop();
      this.objects.forEach(obj => {
        if (patternFn(obj)) {
          obj.receiveWish(sender, wish);
          // In a real implementation, this would be more sophisticated
          console.log(`Object ${obj.id} received wish: ${JSON.stringify(wish, null, 4)}`);
        }
      });
    }
  }

  evaluateWhens() {
    this.whens.forEach(({ condition, action }) => {
      this.objects.forEach((object) => {
        if (condition(object)) {
          action(object);
        }
      });
    });
  }

  run() {
    setTimeout(() => {
      this.evaluateWhens();
      this.evaluateWishes();

      this.run();
    }, 1000/60);
  }
}