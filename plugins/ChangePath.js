export default class ChangePath {
  apply(hooks) {
    hooks.emitFile.tap("change", (ctx) => {
      ctx.change("./dist/chunks.js");
    });
  }
}
