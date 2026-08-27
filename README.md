# Komari Ping Task Bulk

独立的 Komari 延迟监测任务批量导入插件。它以插件页面的形式运行，不打包或修改 Komari 整体前端。

[English](#english)

## 功能

- 批量导入延迟监测任务，支持 TXT、CSV、JSON 对象或 JSON 数组，并显示校验错误和导入结果。
- 通过“快捷导入”选择运营商 CDN 的省级节点、市级节点、IPv4、IPv6 或双栈节点，支持搜索、多选和批量回填。
- CDN 快捷导入固定使用 TCP，间隔可在导入文本中继续调整。

![插件预览](docs/preview.png)

## 安装

1. 从 [Releases](https://github.com/yardbirds0/komari-ping-task-bulk/releases) 下载 ping-task-bulk.zip。
2. 登录 Komari 管理控制面板，打开“插件管理”。
3. 上传 ZIP 插件包，安装后打开“延迟任务批量管理”页面。

要求：

- Komari >= 1.4.3。
- 当前登录用户需要具备导入延迟监测任务的管理员权限。
- 插件使用 Komari 当前会话访问同源管理接口，不保存账号密码或额外的认证信息。

## 使用说明

### 导入任务

每行可以使用逗号、短横线或竖线分隔：

~~~text
Google DNS, 8.8.8.8, icmp, 60
Cloudflare | 1.1.1.1 | icmp | 60
~~~

也支持 JSON 对象或数组：

~~~json
[
  { "name": "Cloudflare", "target": "1.1.1.1", "type": "icmp", "interval": 60 }
]
~~~

导入 CDN 节点时，协议类型固定为 TCP；默认间隔可以调整，生成的文本也可以在导入前继续编辑。

CDN 节点快照来自 [lf3-ips.zstaticcdn.com](https://lf3-ips.zstaticcdn.com/)，仓库内置快照日期为 2026-08-26；快捷导入不依赖运行时联网获取节点列表。

## 开发

~~~bash
npm install
npm test
npm run build
~~~

发布插件包时，确保 ZIP 根目录直接包含以下文件：

~~~text
komari-plugin.json
script.js
dist/
~~~

不要将 node_modules/ 放入插件包。构建后的发布附件为仓库根目录的 ping-task-bulk.zip。

## 许可

[MIT License](LICENSE)

<a id="english"></a>

## English

Komari Ping Task Bulk is an independent Komari plugin page for bulk-importing latency-monitoring tasks. It does not bundle or replace the Komari frontend.

### Features

- Bulk-import latency-monitoring tasks from TXT, CSV, JSON objects, or JSON arrays with validation errors and import results.
- Quickly select province-level or city-level carrier CDN nodes, IPv4, IPv6, or dual-stack endpoints with search and multi-select.
- CDN quick import always uses TCP; the interval remains editable in the import text.

### Installation

1. Download ping-task-bulk.zip from [Releases](https://github.com/yardbirds0/komari-ping-task-bulk/releases).
2. Open Komari's admin panel and go to Plugin Management.
3. Upload the ZIP package and open the Latency Task Bulk Management page.

Requirements: Komari >= 1.4.3 and an authenticated administrator session with permission to import latency-monitoring tasks. The plugin uses Komari's same-origin admin APIs and does not store credentials.

### Usage

Import rows may be comma-, hyphen-, or pipe-delimited. JSON objects and arrays are also supported. CDN quick import uses TCP and lets you edit the interval before importing.

### Development

~~~bash
npm install
npm test
npm run build
~~~

The release ZIP must contain komari-plugin.json, script.js, and dist/ at its root. Do not include node_modules/. The bundled CDN snapshot comes from [lf3-ips.zstaticcdn.com](https://lf3-ips.zstaticcdn.com/) and is dated 2026-08-26.

### License

[MIT License](LICENSE)
