var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var path = require('path');
var webpack = require('webpack');
var fs = require('fs');
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

var srcDir = path.resolve(process.cwd(), 'src');

//获取多页面的每个入口文件，用于配置中的entry
function getEntry() {
    var jsPath = path.resolve(srcDir, 'assets/js');
    var dirs = fs.readdirSync(jsPath);
    var matchs = [], files = {};
    dirs.forEach(function (item) {
        matchs = item.match(/(.+)\.js$/);
        console.log(matchs);
        if (matchs) {
            files[matchs[1]] = path.resolve(srcDir, 'assets/js', item);
        }
    });
    console.log(JSON.stringify(files));
    return files;
}

module.exports = {
    cache: true,
    devtool: "source-map",
    entry: getEntry(),
    output: {
        path: path.join(__dirname, "dist/assets/js/"),
        publicPath: "/assets/js/",//相对当前网页来说异步加载模块读取时引用的目录,所以最后把所有js都放到网站根目录的js文件夹里
        filename: "[name].js",
        chunkFilename: "[chunkhash].chunk.js"//生成的异步加载模块的文件名
    },
    resolve: {
        alias: {
            jquery: srcDir + "/assets/js/lib/jquery.min.js",
            core: srcDir + "/assets/js/core",
            ui: srcDir + "/assets/js/ui"
        }
    },
    plugins: [
        // new CommonsChunkPlugin('common.js'),//注释后就只有一个js文件//如果是单页应用可以才用这个，优点是webpack编译快，但如果是多页应用那么就不用common.js了，除非每写一页面就改一次这个common.js的名字

        // new uglifyJsPlugin({ //压缩代码,调试时可注释,加快编译速度
        //     compress: {
        //         warnings: false
        //     }
        // })
    ]
};