module.exports = ({ isServer = false }) => ({
    test: /\.(png|jpe?g|gif|svg|webp)$/,
    type: 'asset',
    generator: {
        emit: !isServer,
        publicPath: '/dist/',
    },
});
