import fs from "fs";
import path from "path";
import parser from "@babel/parser";
import traverse from "@babel/traverse";
import { transformFromAst } from "@babel/core";
import ejs from "ejs";
import { SyncHook } from "tapable";

import jsonLoader from "./loaders/jsonLoader.js"; // loader
import ChangePath from "./plugins/ChangePath.js"; // plugin

let id = 0;

const webpackConfig = {
  module: {
    rules: [
      {
        test: /\.json$/,
        use: [jsonLoader],
      },
    ],
  },
  plugins: [new ChangePath()],
};

const hooks = {
  emitFile: new SyncHook(["context"]),
};

function initPlugins() {
  const plugins = webpackConfig.plugins;
  plugins.forEach((plugin) => {
    plugin.apply(hooks);
  });
}

initPlugins();

/**
 * 获取文件和引用依赖
 * @param {string} filePath 文件路径
 */
function createAsset(filePath) {
  // 1. 获取文件
  let source = fs.readFileSync(filePath, {
    encoding: "utf-8",
  });

  const rules = webpackConfig.module.rules;

  rules.forEach((rule) => {
    if (rule.test.test(filePath)) {
      rule.use.forEach((loader) => {
        source = loader(source);
      });
    }
  });

  // 2. 获取依赖关系
  // 方案 1 用正则匹配 import ... from ... 获取 (nope)
  // 方案 2 使用 AST（抽象语法树） 获取
  const ast = parser.parse(source, {
    sourceType: "module",
  });

  const { code } = transformFromAst(ast, null, {
    presets: ["@babel/env"],
  });

  const deps = [];
  traverse.default(ast, {
    ImportDeclaration({ node }) {
      deps.push(node.source.value);
    },
  });

  return {
    code,
    id: id++,
    mapping: {},
    deps,
  };
}

/**
 * 获取依赖图
 * https://webpack.docschina.org/concepts/dependency-graph/
 */
function createGraph() {
  const mainAsset = createAsset("./src/main.js");

  const queue = [mainAsset];

  for (const asset of queue) {
    asset.deps.forEach((relativePath) => {
      const child = createAsset(path.resolve("./src", relativePath));
      asset.mapping[relativePath] = child.id;
      queue.push(child);
    });
  }

  return queue;
}

const graph = createGraph();

/**
 * 打包 ejs + graph
 * @param {object} graph 依赖图
 */
function build(graph) {
  const source = fs.readFileSync("./bundle.ejs", {
    encoding: "utf-8",
  });

  const code = ejs.render(source, {
    data: graph,
  });

  let outputPath = "./dist/bundle.js";
  const context = {
    change(path) {
      outputPath = path;
    },
  };
  hooks.emitFile.call(context);

  fs.writeFileSync(outputPath, code);
}

build(graph);
