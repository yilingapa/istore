const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path')
const portfinder = require('portfinder')

module.exports = async () => {
  portfinder.basePort = 8000
  const port = await portfinder.getPortPromise()
  return {
    entry: path.resolve(__dirname, './index.tsx'),
    mode: 'development',
    devtool: 'eval-source-map',
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    devServer: {
      contentBase: './dist',
      port,
      hot: true,
      watchContentBase: true,
      overlay: true,
    },
    module: {
      rules: [
        {
          test: /.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.tsx?$/,
          exclude: /(node_modules)/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
              },
            },
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, './index.html')
      }),
    ]
  }
}