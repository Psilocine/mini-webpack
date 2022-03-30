(function (modules) {
  function require(id) {
    const [fn, mapping] = modules[id];

    const module = {
      exports: {},
    };
    function localRequire(id) {
      const filePath = mapping[id];

      return require(filePath);
    }
    fn(localRequire, module, module.exports);
    return module.exports;
  }

  require(0);
})({
  0: [
    function (require, module, exports) {
      "use strict";

      var _foo = _interopRequireDefault(require("./foo.js"));

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }

      (0, _foo["default"])();
      console.log("main.js");
    },
    { "./foo.js": 1 },
  ],

  1: [
    function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true,
      });
      exports["default"] = _default;

      var _bar = _interopRequireDefault(require("./bar.js"));

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }

      function _default() {
        (0, _bar["default"])();
        console.log("foo.js");
      }
    },
    { "./bar.js": 2 },
  ],

  2: [
    function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true,
      });
      exports.bar = bar;

      function bar() {
        console.log("bar.js");
      }
    },
    {},
  ],
});
