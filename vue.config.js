const MonacoEditorPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
  configureWebpack: {
    plugins: [
      new MonacoEditorPlugin({
        languages: ["markdown"]
      })
    ]
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: "com.mauritzonline.electron-calc",
        linux: {
          target: [
            "AppImage",
            "snap"
          ]
        },
        win: {
          target: ["portable"]
        }
      }
    }
  }
}