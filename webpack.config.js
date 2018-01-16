const path = require('path');

module.exports = {
  entry: './src/app.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
  extensions: [ '.tsx', '.ts', '.js', '.json' ]
},
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
{test: /\.json$/, loader: 'json-loader'}
    ]
  },
  devServer: {
    contentBase: './dist'
  },
};
