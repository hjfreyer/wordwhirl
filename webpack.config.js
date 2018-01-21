const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

/*
var mainCss = ["css-loader", path.join(__dirname, "assets", "style.css")];
mainCss.unshift(
        "file-loader?name=[name].[ext]",
        path.resolve(__dirname, "..", "..", "lib", "extractLoader.js") // should be just "extract" in your case
    );*/
module.exports = {
    entry: {
      shell: './src/shell.ts',
      //css:  mainCss.join("!")
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
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
            {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract({use: "css-loader"})
          }
        ]
    },
    plugins: [
       new ExtractTextPlugin("style.css"),
     ],
    devServer: {
      contentBase: './dist'
    },
};
