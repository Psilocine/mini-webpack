import { SyncHook, AsyncParallelHook } from "tapable";
class Car {
  constructor() {
    this.hooks = {
      accelerate: new SyncHook(["newSpeed"]),
      brake: new SyncHook(),
      calculateRoutes: new AsyncParallelHook([
        "source",
        "target",
        "routesList",
      ]),
    };
  }
  setSpeed(newSpeed) {
    // following call returns undefined even when you returned values
    this.hooks.accelerate.call(newSpeed);
  }
}
const myCar = new Car();

// 注册
myCar.hooks.accelerate.tap("LoggerPlugin", (newSpeed) =>
  console.log(`Accelerating to ${newSpeed}`)
);

// Use the tap method to add a consument
// 派发
myCar.setSpeed(10)
