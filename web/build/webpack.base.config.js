const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const Config = require("../../conf/base.config")
const isProd = require("../../server/middleware/getEnv").isProd();

module.exports = {
  mode: isProd ?'production':'development',
  devtool: isProd
    ? false
    : '#cheap-module-source-map',
  externals: {
    "CKEDITOR": "window.CKEDITOR"
  },
  output: {
    path: '/dist',
    publicPath: '/',
    filename: '[name].js',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../web')
    }
  },
  module: {
    noParse: /es6-promise\.js$/, // avoid webpack shimming process
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            preserveWhitespace: false
          }
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: isProd ? /node_modules/ : /(node_modules|server|build|conf)/,
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.styl(us)?$/,
        use: isProd
          ? ExtractTextPlugin.extract({
            use: [
              {
                loader: 'css-loader',
                options: { minimize: true }
              },
              'stylus-loader'
            ],
            fallback: 'vue-style-loader'
          })
          : ['vue-style-loader', 'css-loader', 'stylus-loader']
      },
      {
        test: /\.less(us)?$/,
        use:  ['vue-style-loader', 'css-loader', 'stylus-loader', 'less-loader']
      },
      {
        test: /\.css(us)?$/,
        use: ['vue-style-loader', 'css-loader']
      },
      {
        test: /\.(eot|woff2?|ttf|svg)$/,
        use: [
          {
            loader: "url-loader",
          }
        ]
      }]
  },
  performance: {
    hints: false
  },
  plugins: isProd
    ? [
      new VueLoaderPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false }
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new ExtractTextPlugin({
        filename: 'common.[chunkhash].css'
      })
    ]
    : [
      new VueLoaderPlugin(),
      new FriendlyErrorsPlugin()
    ]
}
