# Electron Advanced Demo

一个展示 Electron 高级功能和最佳实践的综合性演示应用程序。

## 🚀 功能特性

### 核心功能
- **多窗口管理** - 创建、管理和控制多个应用窗口
- **原生菜单系统** - 完整的应用程序菜单和上下文菜单
- **系统托盘集成** - 系统托盘图标和交互功能
- **进程间通信 (IPC)** - 主进程与渲染进程之间的安全通信
- **文件系统操作** - 文件读写、拖拽、对话框等操作
- **SQLite 数据库** - 本地数据存储和管理
- **原生通知** - 系统级通知支持
- **自动更新** - 应用程序自动更新机制

### 用户界面
- **现代化 React UI** - 使用 React + TypeScript 构建
- **响应式设计** - 适配不同屏幕尺寸
- **主题切换** - 支持浅色/深色/自动主题
- **多语言支持** - 中文/英文界面
- **组件化架构** - 可复用的 UI 组件

### 高级特性
- **设置管理** - 持久化应用设置
- **错误边界** - 优雅的错误处理
- **性能监控** - 应用性能指标
- **安全配置** - 安全的 Electron 配置
- **开发工具** - 热重载、调试支持

## 📋 环境要求

### 必需环境
- **Node.js**: >= 18.0.0 (推荐使用 LTS 版本)
- **npm**: >= 8.0.0 或 **yarn**: >= 1.22.0
- **操作系统**: Windows 10+, macOS 10.15+, 或 Ubuntu 18.04+

### 开发工具（推荐）
- **Visual Studio Code** - 推荐的代码编辑器
- **Git** - 版本控制工具

### 系统特定要求

#### Windows
- **Visual Studio Build Tools** 或 **Visual Studio Community**
- **Python 3.x** (用于原生模块编译)
- **Windows SDK** (最新版本)

#### macOS
- **Xcode Command Line Tools**
```bash
xcode-select --install
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install build-essential libnss3-dev libatk-bridge2.0-dev libdrm2 libxkbcommon-dev libxss1 libasound2-dev
```

## 📦 安装指南

### 1. 克隆项目
```bash
git clone <repository-url>
cd electron-advanced-demo
```

### 2. 环境检查
确认您的环境满足要求：
```bash
node --version  # 应该 >= 18.0.0
npm --version   # 应该 >= 8.0.0
```

### 3. 安装依赖

#### 方法一：标准安装（推荐）
```bash
npm install
```

#### 方法二：如果遇到网络问题
```bash
# 使用国内镜像源
npm config set registry https://registry.npmmirror.com/
npm install

# 或者使用 yarn
yarn install
```

#### 方法三：如果遇到 Electron 下载问题
```bash
# 设置 Electron 镜像
npm config set ELECTRON_MIRROR https://npmmirror.com/mirrors/electron/
npm install

# 或者跳过脚本安装，然后手动安装 Electron
npm install --ignore-scripts
npx electron --version  # 验证 Electron 是否可用
```

### 4. 原生模块重建（如果需要）
如果您遇到 better-sqlite3 相关错误：
```bash
# 使用新的 @electron/rebuild
npm install --save-dev @electron/rebuild
npx electron-rebuild

# 或者只重建 better-sqlite3
npm run rebuild
```

## 🛠️ 开发指南

### 启动开发环境
```bash
# 启动完整开发环境（主进程 + 渲染进程）
npm run dev

# 或者分别启动
npm run dev:main      # 启动主进程开发服务器
npm run dev:renderer  # 启动渲染进程开发服务器
```

### 构建项目
```bash
# 构建所有代码
npm run build

# 分别构建
npm run build:main      # 构建主进程
npm run build:renderer  # 构建渲染进程
```

### 代码质量检查
```bash
npm run lint        # 检查代码风格
npm run lint:fix    # 自动修复代码问题
npm test           # 运行测试
```

## 📱 打包和分发

### 开发测试打包
```bash
npm run pack        # 打包但不创建安装程序
```

### 生产环境打包
```bash
# 打包当前平台
npm run dist

# 打包特定平台
npm run dist:win    # Windows
npm run dist:mac    # macOS  
npm run dist:linux  # Linux
```

### 打包输出
打包后的文件将保存在 `dist/` 目录中：
- **Windows**: `.exe` 安装程序和便携版
- **macOS**: `.dmg` 磁盘映像
- **Linux**: `.AppImage` 可执行文件

## 🔧 故障排除

### 常见问题及解决方案

#### 1. better-sqlite3 安装失败
**问题**: `npm ERR! code ETARGET` 或编译错误

**解决方案**:
```bash
# 方法 1: 清理并重新安装
rm -rf node_modules package-lock.json
npm install

# 方法 2: 使用 electron-rebuild
npm install --save-dev @electron/rebuild
npx electron-rebuild -f -w better-sqlite3

# 方法 3: 手动指定版本
npm install better-sqlite3@11.3.0 --save
```

#### 2. Electron 下载失败
**问题**: `RequestError: socket hang up` 或下载超时

**解决方案**:
```bash
# 设置镜像源
npm config set ELECTRON_MIRROR https://npmmirror.com/mirrors/electron/
npm config set ELECTRON_CACHE_DIR ~/.electron

# 清理缓存重新安装
npm cache clean --force
rm -rf node_modules
npm install
```

#### 3. Node.js 版本不兼容
**问题**: `NODE_MODULE_VERSION` 错误

**解决方案**:
```bash
# 检查版本兼容性
node --version
npx electron --version

# 重建原生模块
npx electron-rebuild
```

#### 4. 权限问题 (Linux/macOS)
**问题**: 权限被拒绝或无法执行

**解决方案**:
```bash
# 修复权限
chmod +x dist/linux-unpacked/electron-advanced-demo
# 或
sudo chown -R $USER:$USER node_modules
```

#### 5. Windows 编译工具缺失
**问题**: `MSBuild` 或 `Visual Studio` 相关错误

**解决方案**:
```bash
# 安装 Windows 构建工具
npm install --global windows-build-tools

# 或者安装 Visual Studio Build Tools
# 下载并安装 Visual Studio Installer
# 选择 "C++ build tools" 工作负载
```

### 网络问题解决方案

#### 使用代理
```bash
npm config set proxy http://proxy-server:port
npm config set https-proxy http://proxy-server:port
```

#### 使用国内镜像
```bash
# npm 镜像
npm config set registry https://registry.npmmirror.com/

# Electron 镜像
npm config set ELECTRON_MIRROR https://npmmirror.com/mirrors/electron/

# Sass 镜像
npm config set sass_binary_site https://npmmirror.com/mirrors/node-sass/
```

## 📁 项目结构

```
electron-advanced-demo/
├── src/
│   ├── main/                 # 主进程代码
│   │   ├── main.ts          # 主进程入口
│   │   ├── window-manager.ts # 窗口管理
│   │   ├── menu-manager.ts   # 菜单管理
│   │   ├── tray-manager.ts   # 托盘管理
│   │   ├── database-manager.ts # 数据库管理
│   │   ├── file-manager.ts   # 文件管理
│   │   ├── notification-manager.ts # 通知管理
│   │   ├── settings-manager.ts # 设置管理
│   │   └── api-manager.ts    # API 管理
│   ├── renderer/             # 渲染进程代码
│   │   ├── components/       # React 组件
│   │   ├── contexts/         # React Context
│   │   ├── pages/           # 页面组件
│   │   ├── styles/          # 样式文件
│   │   ├── App.tsx          # 主应用组件
│   │   └── index.tsx        # 渲染进程入口
│   ├── preload/             # 预加载脚本
│   │   └── preload.ts       # 预加载脚本
│   └── shared/              # 共享代码
│       └── types.ts         # 类型定义
├── build/                   # 构建输出
├── dist/                    # 打包输出
├── package.json             # 项目配置
├── tsconfig.json           # TypeScript 配置
├── webpack.main.config.js   # 主进程 Webpack 配置
├── webpack.renderer.config.js # 渲染进程 Webpack 配置
└── .eslintrc.js            # ESLint 配置
```

## 🛠️ 技术栈

### 主要技术
- **Electron 30.0.0** - 跨平台桌面应用框架::cite[11]
- **React 18.3.0** - 用户界面库
- **TypeScript 5.5.0** - 类型安全的 JavaScript
- **Webpack 5.94.0** - 模块打包工具
- **Better SQLite3 11.3.0** - 高性能 SQLite 数据库::cite[1]

### 开发工具
- **ESLint** - 代码质量检查
- **Babel** - JavaScript 编译器
- **Electron Builder** - 应用打包工具
- **@electron/rebuild** - 原生模块重建工具::cite[8]
- **Concurrently** - 并行运行脚本

### 依赖版本兼容性

| 依赖 | 版本 | Node.js 要求 | 说明 |
|------|------|-------------|------|
| Electron | 30.0.0 | Node.js 20.x | 内置 Chromium 和 Node.js::cite[14] |
| better-sqlite3 | 11.3.0 | Node.js 18+ | 与 Electron 30 兼容::cite[1] |
| TypeScript | 5.5.0 | Node.js 18+ | 最新稳定版 |
| React | 18.3.0 | Node.js 16+ | 当前稳定版 |

## 🎯 主要页面和功能

### 仪表板 (Dashboard)
- 应用概览和统计信息
- 快速访问常用功能
- 系统状态监控

### 文件管理器 (File Manager)
- 文件浏览和操作
- 拖拽文件支持
- 文件信息查看
- 最近文件列表

### 数据库管理 (Database Manager)
- SQLite 数据库操作
- 数据的增删改查
- 数据导入导出
- 数据统计分析

### API 测试器 (API Tester)
- HTTP 请求测试
- 响应数据查看
- 请求历史记录
- 批量请求支持

### 系统信息 (System Info)
- 系统硬件信息
- 应用运行状态
- 性能监控数据
- 环境变量查看

### 设置 (Settings)
- 主题切换设置
- 语言偏好设置
- 通知配置
- 自动启动设置
- 数据导入导出

## 🔧 配置说明

### Electron 安全配置
- 禁用 Node.js 集成
- 启用上下文隔离
- 使用预加载脚本
- CSP 内容安全策略

### 构建配置
- 支持 TypeScript
- 热重载开发
- 代码分割优化
- 资源压缩打包

### 数据库配置
- SQLite WAL 模式
- 自动备份机制
- 数据迁移支持
- 索引优化

## 🚀 部署和分发

### 自动更新配置
1. 配置更新服务器
2. 设置签名证书
3. 配置更新检查
4. 测试更新流程

### 代码签名
```bash
# Windows (需要代码签名证书)
npm run build:win -- --publish=never

# macOS (需要 Apple Developer 账户)
npm run build:mac -- --publish=never

# Linux
npm run build:linux -- --publish=never
```

## 🐛 调试和测试

### 开发者工具
- **主进程调试**: 使用 VS Code 或 Chrome DevTools
- **渲染进程调试**: `F12` 或菜单 -> 查看 -> 开发者工具

### 日志文件位置
- **Windows**: `%USERPROFILE%/AppData/Roaming/electron-advanced-demo/logs/`
- **macOS**: `~/Library/Logs/electron-advanced-demo/`
- **Linux**: `~/.config/electron-advanced-demo/logs/`

### 性能监控
```bash
# 启用性能分析
npm run dev -- --trace-warnings --trace-deprecation
```

## 📝 开发最佳实践

### 添加新功能
1. 在 `src/shared/types.ts` 中定义类型
2. 在主进程中实现功能逻辑
3. 在预加载脚本中暴露 API
4. 在渲染进程中创建 UI 组件

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 组件使用函数式写法
- 使用 React Hooks

### 性能优化
- 使用 React.memo 优化组件
- 合理使用 useCallback 和 useMemo
- 避免不必要的重新渲染
- 优化数据库查询

### 安全考虑
- 始终使用预加载脚本暴露 API
- 验证所有用户输入
- 使用 CSP 防止 XSS 攻击
- 定期更新依赖版本

## 🔄 版本更新日志

### v1.0.0 (2025-09-10)
- ✅ 修复 better-sqlite3 依赖版本问题 (从 ^8.14.0 更新到 ^11.3.0)
- ✅ 更新所有依赖到兼容版本
- ✅ 添加详细的安装和故障排除指南
- ✅ 改进 Electron 安全配置
- ✅ 添加 @electron/rebuild 支持
- ✅ 完善开发工具链配置

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码贡献规范
- 遵循现有的代码风格
- 添加适当的测试
- 更新相关文档
- 确保所有测试通过

## 📞 支持和反馈

### 获取帮助
- 📖 查看本文档的故障排除部分
- 🐛 [提交 Issue](https://github.com/your-username/electron-advanced-demo/issues)
- 💬 [讨论区](https://github.com/your-username/electron-advanced-demo/discussions)

### 常用资源
- [Electron 官方文档](https://www.electronjs.org/docs)::cite[11]
- [Better SQLite3 文档](https://github.com/WiseLibs/better-sqlite3)::cite[1]
- [React 官方文档](https://reactjs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和开源社区，特别是：
- Electron 团队提供的优秀框架
- Better SQLite3 维护者的出色工作::cite[1]
- React 和 TypeScript 社区的持续支持

---

**作者**: 罗杰 (roger)  
**版本**: 1.0.0  
**更新时间**: 2025-09-10  
**Node.js 兼容性**: >= 18.0.0  
**Electron 版本**: 30.0.0