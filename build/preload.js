/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/preload/preload.ts":
/*!********************************!*\
  !*** ./src/preload/preload.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ \"electron\");\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _shared_types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @shared/types */ \"./src/shared/types.ts\");\n\n\n\n// 定义暴露给渲染进程的API接口\n\n// 实现API\nconst electronAPI = {\n  // 窗口管理\n  window: {\n    create: config => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.WINDOW_CREATE, config),\n    close: windowId => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.WINDOW_CLOSE, windowId),\n    minimize: windowId => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.WINDOW_MINIMIZE, windowId),\n    maximize: windowId => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.WINDOW_MAXIMIZE, windowId),\n    restore: windowId => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.WINDOW_RESTORE, windowId),\n    focus: windowId => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.WINDOW_FOCUS, windowId)\n  },\n  // 文件操作\n  file: {\n    openDialog: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.FILE_OPEN_DIALOG),\n    saveDialog: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.FILE_SAVE_DIALOG),\n    read: filePath => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.FILE_READ, filePath),\n    write: (filePath, data) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.FILE_WRITE, filePath, data),\n    delete: filePath => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.FILE_DELETE, filePath),\n    executeOperation: operation => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('file:execute-operation', operation)\n  },\n  // 数据库操作\n  database: {\n    getAll: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.DB_GET_ALL),\n    getById: id => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.DB_GET_BY_ID, id),\n    create: data => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.DB_CREATE, data),\n    update: (id, data) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.DB_UPDATE, id, data),\n    delete: id => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.DB_DELETE, id)\n  },\n  // 系统操作\n  system: {\n    getInfo: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.SYSTEM_INFO),\n    showNotification: options => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.SYSTEM_NOTIFICATION, options),\n    updateTray: options => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.SYSTEM_TRAY_UPDATE, options)\n  },\n  // 设置管理\n  settings: {\n    get: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.SETTINGS_GET),\n    set: settings => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.SETTINGS_SET, settings),\n    reset: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.SETTINGS_RESET)\n  },\n  // API请求\n  api: {\n    request: config => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.API_REQUEST, config)\n  },\n  // 应用控制\n  app: {\n    quit: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.APP_QUIT),\n    restart: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.APP_RESTART),\n    getVersion: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.APP_GET_VERSION)\n  },\n  // 更新管理\n  updater: {\n    check: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.UPDATE_CHECK),\n    download: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.UPDATE_DOWNLOAD),\n    install: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(_shared_types__WEBPACK_IMPORTED_MODULE_1__.IPC_CHANNELS.UPDATE_INSTALL)\n  },\n  // 事件监听\n  on: (channel, callback) => {\n    // 验证通道名称以确保安全\n    const validChannels = ['menu-action', 'tray-action', 'theme-changed', 'settings-changed', 'update-available', 'update-downloaded', 'notification-clicked', 'window-focus', 'window-blur', 'app-ready', 'file-dropped'];\n    if (validChannels.includes(channel)) {\n      electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on(channel, callback);\n    } else {\n      console.warn(`尝试监听未授权的通道: ${channel}`);\n    }\n  },\n  off: (channel, callback) => {\n    electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.off(channel, callback);\n  },\n  once: (channel, callback) => {\n    const validChannels = ['menu-action', 'tray-action', 'theme-changed', 'settings-changed', 'update-available', 'update-downloaded', 'notification-clicked', 'window-focus', 'window-blur', 'app-ready', 'file-dropped'];\n    if (validChannels.includes(channel)) {\n      electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.once(channel, callback);\n    } else {\n      console.warn(`尝试监听未授权的通道: ${channel}`);\n    }\n  },\n  // 发送事件\n  send: (channel, ...args) => {\n    const validChannels = ['renderer-ready', 'window-action', 'user-action', 'app-event'];\n    if (validChannels.includes(channel)) {\n      electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.send(channel, ...args);\n    } else {\n      console.warn(`尝试发送到未授权的通道: ${channel}`);\n    }\n  }\n};\n\n// 暴露API到渲染进程\nelectron__WEBPACK_IMPORTED_MODULE_0__.contextBridge.exposeInMainWorld('electronAPI', electronAPI);\n\n// 暴露一些常用的工具函数\nelectron__WEBPACK_IMPORTED_MODULE_0__.contextBridge.exposeInMainWorld('electronUtils', {\n  // 平台检测\n  platform: process.platform,\n  // 版本信息\n  versions: {\n    node: process.versions.node,\n    chrome: process.versions.chrome,\n    electron: process.versions.electron\n  },\n  // 环境变量\n  isDevelopment: \"development\" === 'development',\n  isProduction: \"development\" === 'production',\n  // 路径工具\n  path: {\n    join: (...paths) => {\n      // 简单的路径连接实现\n      return paths.join('/').replace(/\\/+/g, '/');\n    },\n    basename: path => {\n      return path.split('/').pop() || '';\n    },\n    dirname: path => {\n      const parts = path.split('/');\n      parts.pop();\n      return parts.join('/') || '/';\n    },\n    extname: path => {\n      const basename = path.split('/').pop() || '';\n      const dotIndex = basename.lastIndexOf('.');\n      return dotIndex > 0 ? basename.substring(dotIndex) : '';\n    }\n  },\n  // 格式化工具\n  format: {\n    fileSize: bytes => {\n      if (bytes === 0) return '0 Bytes';\n      const k = 1024;\n      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];\n      const i = Math.floor(Math.log(bytes) / Math.log(k));\n      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];\n    },\n    date: date => {\n      const d = new Date(date);\n      return d.toLocaleString('zh-CN', {\n        year: 'numeric',\n        month: '2-digit',\n        day: '2-digit',\n        hour: '2-digit',\n        minute: '2-digit',\n        second: '2-digit'\n      });\n    },\n    duration: ms => {\n      const seconds = Math.floor(ms / 1000);\n      const minutes = Math.floor(seconds / 60);\n      const hours = Math.floor(minutes / 60);\n      if (hours > 0) {\n        return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;\n      } else if (minutes > 0) {\n        return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;\n      } else {\n        return `${seconds}s`;\n      }\n    }\n  },\n  // 验证工具\n  validate: {\n    email: email => {\n      const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n      return re.test(email);\n    },\n    url: url => {\n      try {\n        new URL(url);\n        return true;\n      } catch {\n        return false;\n      }\n    },\n    filePath: path => {\n      // 简单的文件路径验证\n      return path.length > 0 && !path.includes('..') && !path.startsWith('/');\n    }\n  },\n  // 调试工具\n  debug: {\n    log: (...args) => {\n      if (true) {\n        console.log('[Renderer Debug]', ...args);\n      }\n    },\n    error: (...args) => {\n      console.error('[Renderer Error]', ...args);\n    },\n    warn: (...args) => {\n      console.warn('[Renderer Warning]', ...args);\n    }\n  }\n});\n\n// 在窗口加载完成后通知主进程\nwindow.addEventListener('DOMContentLoaded', () => {\n  electronAPI.send('renderer-ready');\n});\n\n// 全局错误处理\nwindow.addEventListener('error', event => {\n  console.error('渲染进程错误:', event.error);\n});\nwindow.addEventListener('unhandledrejection', event => {\n  console.error('未处理的Promise拒绝:', event.reason);\n});\n\n// 类型声明（用于TypeScript）\n\n//# sourceURL=webpack://electron-advanced-demo/./src/preload/preload.ts?\n}");

/***/ }),

/***/ "./src/shared/types.ts":
/*!*****************************!*\
  !*** ./src/shared/types.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   IPC_CHANNELS: () => (/* binding */ IPC_CHANNELS)\n/* harmony export */ });\n// 共享类型定义\n\n// IPC 通道定义\nconst IPC_CHANNELS = {\n  // 窗口管理\n  WINDOW_CREATE: 'window:create',\n  WINDOW_CLOSE: 'window:close',\n  WINDOW_MINIMIZE: 'window:minimize',\n  WINDOW_MAXIMIZE: 'window:maximize',\n  WINDOW_RESTORE: 'window:restore',\n  WINDOW_FOCUS: 'window:focus',\n  // 文件操作\n  FILE_OPEN_DIALOG: 'file:open-dialog',\n  FILE_SAVE_DIALOG: 'file:save-dialog',\n  FILE_READ: 'file:read',\n  FILE_WRITE: 'file:write',\n  FILE_DELETE: 'file:delete',\n  // 数据库操作\n  DB_GET_ALL: 'db:get-all',\n  DB_GET_BY_ID: 'db:get-by-id',\n  DB_CREATE: 'db:create',\n  DB_UPDATE: 'db:update',\n  DB_DELETE: 'db:delete',\n  // 系统操作\n  SYSTEM_INFO: 'system:info',\n  SYSTEM_NOTIFICATION: 'system:notification',\n  SYSTEM_TRAY_UPDATE: 'system:tray-update',\n  // 设置管理\n  SETTINGS_GET: 'settings:get',\n  SETTINGS_SET: 'settings:set',\n  SETTINGS_RESET: 'settings:reset',\n  // 应用更新\n  UPDATE_CHECK: 'update:check',\n  UPDATE_DOWNLOAD: 'update:download',\n  UPDATE_INSTALL: 'update:install',\n  // 外部API\n  API_REQUEST: 'api:request',\n  // 应用控制\n  APP_QUIT: 'app:quit',\n  APP_RESTART: 'app:restart',\n  APP_GET_VERSION: 'app:get-version'\n};\n\n//# sourceURL=webpack://electron-advanced-demo/./src/shared/types.ts?\n}");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("electron");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/preload/preload.ts");
/******/ 	
/******/ })()
;