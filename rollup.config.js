// rollup.config.js
var babel = require("rollup-plugin-babel");
var serve = require("rollup-plugin-serve");

export default {
  entry: "src/index.js",
  format: "umd",
  moduleName: "fullpage",
  plugins: [
  	serve({
  	  contentBase: ["."]
  	}),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ],
  dest: 'dist/fullpage.js' // equivalent to --output
};