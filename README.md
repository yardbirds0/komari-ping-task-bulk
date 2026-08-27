# Komari Ping Task Bulk

独立的 Komari 延迟监测任务管理插件。它以插件页面的形式运行，不打包或修改 Komari 整体前端，适合集中维护大量 Ping 任务。

[English](#english)

## 功能

- 批量选择、删除和编辑延迟监测任务。
- 在任务表中显示应用服务器名称、默认开启状态，并可逐任务修改应用服务器。
- 通过任务名前的三条横线拖动排序；支持鼠标跟随预览、行位移动画、插入位置提示和键盘操作，顺序同步到 Komari 运维任务列表。
- 导入 TXT、CSV、JSON 对象或 JSON 数组，并显示导入结果和错误信息。
- 通过“快捷导入”选择运营商 CDN 的省级节点、市级节点、IPv4、IPv6 或双栈节点，支持搜索、多选和批量回填。
- CDN 快捷导入固定使用 TCP，间隔可在导入文本中继续调整。
- 根据任务数量、任务-服务器关联数量和检测间隔估算每日存储占用，并明确标注估算依据。
- 根据 Komari 当前语言显示中文（简体，默认）、繁体中文、English、日本語或 Bahasa Indonesia。

![插件预览](docs/preview.png)

## 安装

1. 从 [Releases](https://github.com/yardbirds0/komari-ping-task-bulk/releases) 下载 ping-task-bulk.zip。
2. 登录 Komari 管理控制面板，打开“插件管理”。
3. 上传 ZIP 插件包，安装后打开“延迟任务批量管理”页面。

要求：

- Komari >= 1.4.3。
- 当前登录用户需要具备管理延迟监测任务和查看应用服务器的权限。
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

### 调整顺序

- 鼠标：按住任务名前的三条横线，拖动到目标位置后松开。
- 键盘：聚焦拖动按钮后按 Space 或 Enter 抓取，使用方向键移动，再按 Space 或 Enter 放置；按 Esc 取消。

保存顺序使用 Komari 官方的 /api/admin/ping/order 接口，因此会与 Komari 运维页面中的任务顺序同步。

### 存储估算

页面使用每次检测约 190 B 的估算值，并按每个任务-服务器关联的检测间隔计算每天的记录量。实际占用仍取决于 metric store 的保留策略、汇总、压缩方式和数据库类型。

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

Komari Ping Task Bulk is an independent plugin page for managing latency-monitoring tasks in bulk. It runs as a Komari plugin and does not bundle or replace the Komari frontend.

### Features

- Select, delete, and edit multiple latency-monitoring tasks.
- Show application-server names and default-enabled status, with per-task server editing.
- Reorder tasks from the three-line handle with pointer-following preview, row transitions, insertion feedback, and keyboard support. The order is saved to Komari's operations list.
- Import TXT, CSV, JSON objects, and JSON arrays with validation errors and import results.
- Quickly select province-level or city-level carrier CDN nodes, IPv4, IPv6, or dual-stack endpoints with search and multi-select.
- CDN quick import always uses TCP; the interval remains editable in the import text.
- Show a clearly labeled daily storage estimate based on task-server links, task intervals, and an estimated 190 bytes per ping.
- Follow Komari's active locale: Simplified Chinese (default), Traditional Chinese, English, Japanese, or Indonesian.

### Installation

1. Download ping-task-bulk.zip from [Releases](https://github.com/yardbirds0/komari-ping-task-bulk/releases).
2. Open Komari's admin panel and go to Plugin Management.
3. Upload the ZIP package and open the Latency Task Bulk Management page.

Requirements: Komari >= 1.4.3 and an authenticated administrator session with permission to manage latency tasks and view application servers. The plugin uses Komari's same-origin admin APIs and does not store credentials.

### Usage

Use the three-line handle to drag a task. During a keyboard drag, press Space or Enter to pick up and drop, use the arrow keys to move, and press Esc to cancel.

Import rows may be comma-, hyphen-, or pipe-delimited. JSON objects and arrays are also supported. CDN quick import uses TCP and lets you edit the interval before importing.

The page estimates daily storage using 190 bytes per ping, task-server links, and each task's interval. The estimate is informational; actual usage depends on metric-store retention, rollups, compression, and the database engine.

### Development

~~~bash
npm install
npm test
npm run build
~~~

The release ZIP must contain komari-plugin.json, script.js, and dist/ at its root. Do not include node_modules/. The bundled CDN snapshot comes from [lf3-ips.zstaticcdn.com](https://lf3-ips.zstaticcdn.com/) and is dated 2026-08-26.

### License

[MIT License](LICENSE)
