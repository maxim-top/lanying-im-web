const webpack = require("webpack");
const path = require("path");

const CleanWebpackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const projectDir = path.join(__dirname, "..");
const srcDir = path.join(projectDir, 'src');

module.exports = env => {
    let SDK_PATH = path.join(projectDir, 'lib', 'floo-1.0.0.js');

    if ("source" === process.env.sdk) {
        console.log("use sdk source files");
        SDK_PATH = path.join(srcDir, 'sdk', 'index.js');
    }
    return {

        entry: {
            vendors: [
                "vue",
                "vuex",
                "axios",
                "lodash",
            ],
            sdk: SDK_PATH,
            app: path.join(projectDir, "src", "main.js"),
        },
        module: {
            rules: [
                { test: /\.js$/,
                  exclude: /(node_modules|lib)/,
                  loader: 'eslint-loader',
                  options: {
                      // eslint options (if necessary)
                  },
                },
            ]},

        plugins: [
            new CleanWebpackPlugin(["dist"], {
                root: projectDir,
            }),

            new webpack.DefinePlugin({
                "process.env.NODE_ENV": '"development"',
            }),

            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[id].css",
            }),

            new HtmlWebpackPlugin({
                template: path.join(projectDir, "public", "index.html"),
                filename: "index.html",
                inject: "body",
                minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                },
                favicon: path.join(projectDir, "public", "favicon.ico"),
            }),

            new webpack.HotModuleReplacementPlugin(),
        ],

        devServer: {
            port: 443,
            // inline: true,
            hot: true,
            open: true,
            host: "dev.maximtop.com",
            disableHostCheck: true,
            https: true,
            // proxy: {
            //   "**/*.do": {
            //     target: devConfig.apiUrl,
            //     onProxyReq (proxyReq) {
            //       proxyReq.setHeader("host", url.parse(devConfig.apiUrl).host);
            //     },
            //   },
            // },
        },

        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendors: {
                        name: "vendors",
                        chunks: "initial",
                        minChunks: 2,
                    },
                    manifest: {
                        name: "manifest",
                        chunks: "initial",
                        minChunks: 2,
                    },
                },
            },
        },

        stats: "normal",
    };
};
