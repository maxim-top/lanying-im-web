## 美信拓扑 IM web 版

[美信拓扑](https://www.maximtop.com/)，一键启用多云架构的即时通讯云服务

美信拓扑 IM 为美信拓扑云服务的 DemoApp，方便 App 开发者体验和使用 IM SDK，可以直接[在线试用](https://chat.maximtop.com)，也可以在官网[下载页面](https://www.maximtop.com/downloads/)选择试用所有客户端。

DemoApp 是为了演示 IM SDK 调用而开发，也因此最好的开发方式为根据 DemoApp 找到功能，然后直接查看使用示例.

[![Scc Count Badge](https://sloc.xyz/github/maxim-top/maxim-web/?category=total&avg-wage=1)](https://github.com/maxim-top/maxim-web/) [![Scc Count Badge](https://sloc.xyz/github/maxim-top/maxim-web/?category=code&avg-wage=1)](https://github.com/maxim-top/maxim-web/)

### 构建

本工程为标准 web 工程，推荐使用 yarn 来操作：

1. 构建工程
   ```
   yarn build
   ```
2. 本地运行

   配置本地 `/etc/hosts` 表，增加一行

   ```
   127.0.0.1   dev.maximtop.com
   ```

   然后再运行

   ```
   yarn dev
   ```

3. 打包应用
   ```
   yarn pack
   ```

### 开发自己的应用

请先修改美信拓扑 AppID

打开文件 `./src/App.vue`, 将默认 AppID: welovemaxim 更改为你的应用 AppID，此 AppID 为在[美信拓扑后台](https://console.maximtop.com/)创建应用后获取。

### 常见问题

1. 无法导入 flooim，提示

```
export 'flooim' was not found in '../im/floo-2.0.0'
```

参考修改 babel.config.js，增加 sourceType: 'unambiguous' 设置：

```
module.exports = {
    presets: ["@vue/app", {sourceType: 'unambiguous'}],
};
```

了解更多信息可以阅读[在线文档](https://www.maximtop.com/docs/)，或者在本仓库提问，好好玩 :)
