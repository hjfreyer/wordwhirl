const path = require('path');

module.exports = {
    entry: {
      shell: './src/shell.ts',
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist') ,
      chunkFilename: '[name].bundle.js',
    },
    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },

    devServer: {
      contentBase: './dist'
    },
};
