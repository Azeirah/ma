function genHexString(len: number) {
    const hex = '0123456789ABCDEF';
    let output = '';
    for (let i = 0; i < len; ++i) {
        output += hex.charAt(Math.floor(Math.random() * hex.length));
    }
    return output;
}

type WishMessage = any;
type WishMatcher = (wish: WishMessage) => boolean;
type WishHandler = (me: MaObject, wish: WishMessage) => void;

type Wish = { sender: MaObject, patternFn: MaObjectMatcher, wish: WishMessage };

type MaObjectMatcher = (it: MaObject) => boolean;
type MaAction = (it: MaObject) => void;

export class MaObject {
  private claims: Map<any, any>;
  private wishHandlers: Map<string, {
    patternFn: WishMatcher,
    handler: WishHandler;
  }>;

  constructor(public id: string, public  runtime: Ma) {
    this.claims = new Map();
    this.wishHandlers = new Map();
  }

  claim(key: string, value: unknown) {
    this.claims.set(key, value);
  }

  handleWish(patternFn: WishMatcher, handler: WishHandler) {
    this.wishHandlers.set(patternFn.toString(), {patternFn, handler});
  }

  receiveWish(sender: MaObject, wish: WishMessage) {
    this.wishHandlers.forEach(({patternFn, handler}) => {
      if (patternFn(wish)) {
        console.log(`${this.id} received a wish from ${sender.id}`);
        handler(this, wish);
      }
    });
  }

  wish(patternFn: MaObjectMatcher, wish: WishMessage) {
    this.runtime.broadcastWish(this, patternFn, wish);
  }

  has(key: string) {
    return this.claims.has(key);
  }

  get(key: string) {
    return this.claims.get(key);
  }
}


export class Ma {
  private objects: Map<string, MaObject>;
  private whens: {condition: MaObjectMatcher, action: MaAction}[];
  private wishQueue: Wish[];

  constructor() {
    this.objects = new Map();
    this.whens = [];
    this.wishQueue = [];
  }

  createObject(program: (I: MaObject, ma: Ma) => void) {
    const id = genHexString(16);
    const obj = new MaObject(id, this);
    this.objects.set(id, obj);
    program(obj, this);
    return obj;
  }

  when(condition: MaObjectMatcher, action: MaAction) {
    this.whens.push({ condition, action });
  }

  broadcastWish(sender: MaObject, patternFn: MaObjectMatcher, wish: WishMessage) {
    this.wishQueue.push({sender, patternFn, wish});
  }

  evaluateWishes() {
    while (this.wishQueue.length) {
      const {sender, patternFn, wish} = this.wishQueue.pop() as Wish;
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