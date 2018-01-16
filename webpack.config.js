const path = require('path');

module.exports = {
  entry: {
    app: './src/app.ts',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist') ,
    chunkFilename: '[name].bundle.js',
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
    ]
  },
  devServer: {
    contentBase: './dist'
  },
};
