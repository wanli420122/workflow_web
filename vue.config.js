const CompressionWebpackPlugin = require('compression-webpack-plugin'),
    productionGzipExtensions = ['js', 'css'];
let path = require('path')

function resolve(dir) {
    return path.join(__dirname, dir)
}
module.exports = {
    lintOnSave: false,
    productionSourceMap: false,
    // publicPath: process.env.NODE_ENV === "production" ? '/Workflow/' : '/',
    outputDir: "dist",
    publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
    // 标签页icon小图标配置
    pwa: {
        iconPaths: {
          favicon32: '',
          favicon16: '',
          appleTouchIcon: '',
          maskIcon: '',
          msTileImage: ''
        }
    },
    /* scss的配置 */
    css: {
        loaderOptions: {
            // sass: {
            //     prependData: `@import "";`
            // },
            scss: {
                prependData: `@import "@/assets/scss/style.scss";`   
            },
        },
    },
    // devServer: {
    //     disableHostCheck: true,
    //     https: false, // https:{type:Boolean}
    //     port: 8085,
    // },
    devServer: {
        port: 8085,
        open: true,
        overlay: {
          warnings: false,
          errors: true
        },
        proxy: {
            '/api': { //代理的请求
                target: 'http://196.168.66.134:8181',//代理的目标地址
                changOrigin: true,
                //开启代理：在本地会创建一个代理服务，然后发送请求的数据，并同时接收请求的数据，这样客户端端和服务端进行数据的交互就不会有跨域问题
                ws: false,
            　　//关闭ws代理，代理全部请求时开启时，ws会导致webpack刷新报错
                pathRewrite: {
                    '^/api': "/" //api相当于一个别名，代指192.168.0.131:8010
                }
            },
            '/web': { //代理的请求
                target: 'http://196.168.66.30:8080',//代理的目标地址
                changOrigin: true,
                //开启代理：在本地会创建一个代理服务，然后发送请求的数据，并同时接收请求的数据，这样客户端端和服务端进行数据的交互就不会有跨域问题
                ws: false,
        　　　　//关闭ws代理，代理全部请求时开启时，ws会导致webpack刷新报错
                pathRewrite: {
                    '^/web': "/" //api相当于一个别名，代指192.168.0.131:8010
                }
            },
        }
    },
    chainWebpack: config => {
        config.resolve.alias.set('@', resolve('src'));
        config.performance.set('hints', false);
        config.output.filename('[name].[hash].js').end();
    },
    configureWebpack: config => {
        //配置参数详解https://www.webpackjs.com/plugins/compression-webpack-plugin/
        if (process.env.NODE_ENV !== 'development') { // 非开发环境
            config.plugins.push(new CompressionWebpackPlugin({
                algorithm: 'gzip', //algorithm： 可以是 function(buf, callback) 或者字符串。对于字符串来说依照 zlib 的算法(或者 zopfli 的算法)。默认值是 "gzip"。
                test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'), //test： 所有匹配该正则的资源都会被处理。默认值是全部资源。
                threshold: 10240, //threshold： 只有大小大于该值的资源会被处理。单位是 bytes。默认值是 0。
                minRatio: 0.8 //minRatio： 只有压缩率小于这个值的资源才会被处理。默认值是 0.8。
            }))
        }
    }
}