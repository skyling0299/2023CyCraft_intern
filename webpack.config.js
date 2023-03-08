const path = require('path');

module.exports = [
    "source-map"
].map(devtool =>({
    
    entry: {
        content: '/scripts/content.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean : true
    },
    
    mode: 'development',
    devtool
}))
