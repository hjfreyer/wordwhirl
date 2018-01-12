const path = require('path');
//const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const MinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
  entry: './src/ww-app/view.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
},
 plugins: [
//    new MinifyPlugin( )
 ],module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    },      { test: /\.tsx?$/, loader: 'ts-loader' }

  ]
}
};
