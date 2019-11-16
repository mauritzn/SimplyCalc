module.exports = {
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