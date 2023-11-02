const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PostCSSPlugins = require('postcss-preset-env');

module.exports = ({ isScss = true, isServer = false, exclude, prodEnv = true }) => ({
    test: isScss ? /\.s(c|a)ss$/ : /\.css/,
    use: [
        isServer
            ? undefined
            : prodEnv
                ? {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        publicPath: "/dist",
                        emit: !isServer,
                    },
                }
                : 'style-loader',
        {
            loader: 'css-loader',
            options: {
                modules: {
                    mode: 'local',
                    exportOnlyLocals: isServer,
                    localIdentName: prodEnv ? '[hash:base64:8]' : '[folder]__[local]___[hash:base64:5]',
                },
                import: {
                    filter: (url, media, resourcePath) => {
                        if (resourcePath.includes("global.scss")) {
                            return false;
                        }
        
                        return true;
                    },
                },
            },
        },
        {
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins: [
                        PostCSSPlugins({
                            stage: 0,
                        }),
                    ],
                },
            },
        },
        isScss ? {
            loader: 'sass-loader',
            options: {
                sourceMap: true,
            }
        } : undefined,
    ].filter(Boolean),
    exclude,
});
