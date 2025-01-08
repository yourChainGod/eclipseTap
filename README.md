# Eclipse Tap - 全自动养牛场 🐂

一个基于 Go + WebAssembly 开发的 Eclipse 自动点击工具。

## 特性

- 🚀 纯前端实现，无需后端服务
- 💻 本地运行，安全可靠
- 🎯 支持多账号管理
- ⚙️ 可配置点击延迟
- 💾 支持配置导入导出

## 使用说明
<img width="1093" alt="image" src="https://github.com/user-attachments/assets/9d4224e7-14de-45a0-b63e-0a496fba94c3" />

<img width="852" alt="image" src="https://github.com/user-attachments/assets/5c6f706a-cf69-44a5-8b93-6db8aa8f69c1" />

1. 主账号地址：填写你的 BackPack 钱包地址

2. 用户私钥获取方法：
   - 打开 Chrome 开发者工具（F12）
   - 在控制台输入：`console.log(localStorage.getItem('wallet'));`
   - 复制输出的私钥

3. 延迟设置：
   - 建议最小延迟 1000ms
   - 建议最大延迟 2000ms

4. 批量管理：
   - 点击"导出配置"可以导出当前所有任务配置
   - 点击"导入配置"可以批量导入任务配置

## 本地运行

1. 克隆项目：

```bash
git clone https://github.com/yourChainGod/eclipseTap.git
cd eclipseTap
go mod tidy
```

2. 编译 WebAssembly：

```bash
CGO_ENABLED=0 GOOS=js GOARCH=wasm go build -ldflags="-s -w" -o main.wasm main.go
```

3. 启动本地服务器：

在目录随便起一个http服务器，比如python3 -m http.server


## 项目结构

```
├── main.go # Go/WASM 主程序
├── index.html # 前端页面
├── main.js # JavaScript 主程序
└── wasm_exec.js # Go WASM 运行时
```

## 注意事项

- 本工具仅供学习交流使用
- 所有操作均在本地执行，关闭浏览器后任务将停止
- 请合理设置延迟，避免请求过于频繁
- 建议使用最新版本的 Chrome 浏览器

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License


## 免责声明

本项目仅供学习交流使用，使用本工具所产生的任何后果由使用者自行承担。作者不对因使用本工具而导致的任何损失负责。
