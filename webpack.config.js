const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './app/final/index.js',
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.js', '.json', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './app/index.tpl.html',
            filename: 'index.html',
            inject: 'body'
        })
    ],
    // Global ignore
    watchOptions: {
        ignored: ['**/node_modules', '**/data/**'],
    },
    devServer: {
        static: [
            {
                directory: path.join(__dirname, 'dist'),
            },
            {
                directory: path.join(__dirname, '.'),
                // Specific ignore for the static server watcher
                watch: {
                    ignored: /data/,
                }
            }
        ],
        historyApiFallback: true,
        port: 3000,
        hot: true,
        client: {
            overlay: false,
        }
    }
};