const { defineConfig } = require('@vue/cli-service')
// const path = require('path')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  css: {
    loaderOptions: {
      less: {
        // 若 less-loader 版本小于 6.0，请移除 lessOptions 这一级，直接配置选项。
        lessOptions: {
          modifyVars: {
            // 直接覆盖变量
            'nav-bar-background-color': '#007bff',
            'nav-bar-title-text-color': '#fff',
            'tabs-bottom-bar-color': '#007bff',
            'nav-bar-icon-color': '#fff'
            // 或者可以通过 less 文件覆盖（文件路径为绝对路径）
            // __dirname(2个下划线) 它是node环境下全局内置变量
            // 当前文件所在文件夹的绝对路径
            // __dirname 值：D:\ITheima\vue\heimatoutiao
            // hack: `true; @import "${path.join(__dirname, '/src/styles/ConvolverNode.less')}";`
          }
        }
      }
    }
  },
  publicPath: './' // 告诉webpack打包的index.html引入其他资源文件以./开头，不要默认/开头
})
