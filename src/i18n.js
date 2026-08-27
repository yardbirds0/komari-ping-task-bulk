import React from "react";

const messages = {
  en: {
    close: "Close",
    select: "Select",
    selected: "selected",
    selectedOf: "Selected {selected} / {total}",
    all: "All",
    success: "Success",
    error: "Error",
    done: "Done",
    search: "Search",
    refresh: "Refresh",
    refreshing: "Refreshing...",
    importTasks: "Import tasks",
    pluginEyebrow: "Komari plugin",
    pageTitle: "Ping task bulk management",
    pageSubtitle: "Maintain monitoring tasks in one place.",
    taskCount: "{count} tasks",
    selectedCount: "Selected {count}",
    loadingTasks: "Loading tasks...",
    noTasks: "No ping tasks",
    noTasksHint: "Use “Import tasks” to create them in bulk.",
    importTitle: "Import ping tasks",
    importResult: "Import results",
    confirmTitle: "Confirm import",
    preview: "Preview",
    pendingSummary: "{pending} pending, {failed} errors",
    name: "Name",
    target: "Target",
    type: "Type",
    interval: "Interval",
    status: "Status",
    note: "Note",
    pending: "Pending",
    server: "Servers",
    serverCount: "{count} selected",
    defaultOn: "Enable by default",
    serverHelper: "New servers will use this monitor automatically; existing servers are unchanged.",
    servers: "Servers",
    defaultEnabled: "Enabled by default",
    selectAll: "Select all",
    retry: "Retry",
    unnamedTask: "Unnamed task",
    appServers: "Application servers",
    deleteDone: "Selected ping tasks deleted.",
    editDone: "Batch changes saved.",
    sampleLine: "Google DNS, 8.8.8.8, icmp, 60",
    sampleJson: "[ { \"name\": \"Cloudflare\", \"target\": \"1.1.1.1\", \"type\": \"icmp\", \"interval\": 60 } ]",
    importFile: "Import file",
    quickCdn: "Quick import",
    startImport: "Start import",
    importing: "Importing...",
    cancel: "Cancel",
    confirmImport: "Confirm import",
    noValidTasks: "There are no valid tasks to import.",
    selectServer: "Select at least one server or enable the default option.",
    addedCdn: "Added {count} CDN nodes ({type} / {interval}s). You can edit them in the text area.",
    importComplete: "Import complete: {success} succeeded, {failed} failed.",
    importCompleteShort: "Import complete: {success} succeeded.",
    fileFormats: "TXT / JSON / CSV files are supported",
    dataSource: "Data source: lf3-ips.zstaticcdn.com",
    inputHint: "Each line: name, target, type, interval; JSON objects or arrays are also supported. Separators: comma, hyphen or pipe.",
    dualStack: "Dual stack",
    cdnLevel: "Node level",
    provinceNodes: "Province nodes",
    cityNodes: "City nodes",
    provinceProtocol: "Province protocol",
    searchCdn: "Search province, city or node address",
    shownNodes: "Showing {visible} / {total} nodes, {selected} selected",
    selectAllResults: "Select all results",
    deselectAllResults: "Deselect all results",
    noMatchingNodes: "No matching nodes",
    cdnDefaultType: "Default type",
    defaultInterval: "Default interval",
    seconds: "sec",
    addToImport: "Add to import list",
    selectCdn: "Select at least one CDN node.",
    invalidInterval: "The default interval must be an integer greater than 0.",
    editTitle: "Edit {count} tasks",
    changeInterval: "Change interval",
    changeServers: "Change application servers",
    saveChanges: "Save changes",
    saving: "Saving...",
    atLeastOneChange: "Select at least one field to change.",
    intervalPositive: "The interval must be an integer greater than 0.",
    nonDefaultServerRequired: "Non-default tasks cannot have an empty server list.",
    deleteTitle: "Delete {count} tasks",
    deleteWarning: "This also removes their latency history and cannot be undone.",
    confirmDelete: "Confirm delete",
    deleting: "Deleting...",
  },
  "zh-CN": {
    close: "关闭", select: "选择", selected: "选择", selectedOf: "已选 {selected} / 共 {total}", all: "全部", success: "成功", error: "错误", done: "完毕", search: "搜索", refresh: "刷新", refreshing: "刷新中...", importTasks: "导入任务", pluginEyebrow: "Komari 插件", pageTitle: "延迟任务批量管理", pageSubtitle: "集中维护监测任务，减少重复操作。", taskCount: "{count} 个任务", selectedCount: "已选 {count}", loadingTasks: "加载任务中...", noTasks: "暂无延迟任务", noTasksHint: "可以使用“导入任务”批量创建。", importTitle: "导入延迟任务", importResult: "导入结果", confirmTitle: "确认导入", preview: "预览", pendingSummary: "{pending} 条待导入，{failed} 条错误", name: "名称", target: "目标", type: "类型", interval: "间隔", status: "状态", note: "备注", pending: "待导入", server: "服务器", serverCount: "已选 {count} 个", defaultOn: "默认开启", serverHelper: "开启后，新加入的服务器会自动启用此监测；已存在的服务器不受影响。", servers: "服务器", defaultEnabled: "默认开启", selectAll: "全选", retry: "重试", unnamedTask: "未命名任务", appServers: "应用服务器", deleteDone: "已删除选中的延迟任务", editDone: "批量修改已保存", sampleLine: "Google DNS, 8.8.8.8, icmp, 60", sampleJson: "[ { \"name\": \"Cloudflare\", \"target\": \"1.1.1.1\", \"type\": \"icmp\", \"interval\": 60 } ]", importFile: "导入文件", quickCdn: "快捷导入", startImport: "开始导入", importing: "导入中...", cancel: "取消", confirmImport: "确定导入", noValidTasks: "没有可以导入的有效任务。", selectServer: "请至少选择一个服务器，或开启默认应用。", addedCdn: "已加入 {count} 个 CDN 节点（{type} / {interval}s），可在文本框中继续调整。", importComplete: "导入完成：成功 {success} 条，失败 {failed} 条。", importCompleteShort: "导入完成：成功 {success} 条。", fileFormats: "支持 TXT / JSON / CSV 文件", dataSource: "数据来源：lf3-ips.zstaticcdn.com", inputHint: "每行格式：name, target, type, interval；也支持 JSON 对象或数组。分隔符可用逗号、短横线或竖线。", dualStack: "双栈", cdnLevel: "节点级别", provinceNodes: "省级节点", cityNodes: "市级节点", provinceProtocol: "省级协议", searchCdn: "搜索省份、城市或节点地址", shownNodes: "当前显示 {visible} / {total} 个节点，已选 {selected}", selectAllResults: "全选当前结果", deselectAllResults: "取消全选", noMatchingNodes: "没有匹配的节点", cdnDefaultType: "默认类型", defaultInterval: "默认间隔", seconds: "秒", addToImport: "加入导入列表", selectCdn: "请至少选择一个 CDN 节点。", invalidInterval: "默认间隔必须是大于 0 的整数。", editTitle: "批量编辑 ({count})", changeInterval: "修改监测间隔", changeServers: "修改应用服务器", saveChanges: "保存修改", saving: "保存中...", atLeastOneChange: "至少选择一项要修改的字段。", intervalPositive: "间隔必须是大于 0 的整数。", nonDefaultServerRequired: "非默认任务不能设置为空服务器列表。", deleteTitle: "删除 {count} 个任务", deleteWarning: "删除后会同时清理这些任务的历史延迟记录，此操作不可撤销。", confirmDelete: "确认删除", deleting: "删除中...",
  },
  "zh-TW": {
    close: "關閉", select: "選擇", selected: "選擇", selectedOf: "已選 {selected} / 共 {total}", all: "全部", success: "成功", error: "錯誤", done: "完成", search: "搜尋", refresh: "重新整理", refreshing: "重新整理中...", importTasks: "匯入任務", pluginEyebrow: "Komari 外掛", pageTitle: "延遲任務批次管理", pageSubtitle: "集中維護監測任務，減少重複操作。", taskCount: "{count} 個任務", selectedCount: "已選 {count}", loadingTasks: "載入任務中...", noTasks: "暫無延遲任務", noTasksHint: "可以使用「匯入任務」批次建立。", importTitle: "匯入延遲任務", importResult: "匯入結果", confirmTitle: "確認匯入", preview: "預覽", pendingSummary: "{pending} 筆待匯入，{failed} 筆錯誤", name: "名稱", target: "目標", type: "類型", interval: "間隔", status: "狀態", note: "備註", pending: "待匯入", server: "伺服器", serverCount: "已選 {count} 個", defaultOn: "預設開啟", serverHelper: "開啟後，新加入的伺服器會自動啟用此監測；已存在的伺服器不受影響。", servers: "伺服器", defaultEnabled: "預設開啟", selectAll: "全選", retry: "重試", unnamedTask: "未命名任務", appServers: "應用伺服器", deleteDone: "已刪除選取的延遲任務", editDone: "批次修改已儲存", sampleLine: "Google DNS, 8.8.8.8, icmp, 60", sampleJson: "[ { \"name\": \"Cloudflare\", \"target\": \"1.1.1.1\", \"type\": \"icmp\", \"interval\": 60 } ]", importFile: "匯入檔案", quickCdn: "快速匯入", startImport: "開始匯入", importing: "匯入中...", cancel: "取消", confirmImport: "確定匯入", noValidTasks: "沒有可以匯入的有效任務。", selectServer: "請至少選擇一個伺服器，或開啟預設套用。", addedCdn: "已加入 {count} 個 CDN 節點（{type} / {interval}s），可在文字框中繼續調整。", importComplete: "匯入完成：成功 {success} 筆，失敗 {failed} 筆。", importCompleteShort: "匯入完成：成功 {success} 筆。", fileFormats: "支援 TXT / JSON / CSV 檔案", dataSource: "資料來源：lf3-ips.zstaticcdn.com", inputHint: "每行格式：name, target, type, interval；也支援 JSON 物件或陣列。分隔符可用逗號、短橫線或豎線。", dualStack: "雙棧", cdnLevel: "節點級別", provinceNodes: "省級節點", cityNodes: "市級節點", provinceProtocol: "省級協定", searchCdn: "搜尋省份、城市或節點位址", shownNodes: "目前顯示 {visible} / {total} 個節點，已選 {selected}", selectAllResults: "全選目前結果", deselectAllResults: "取消全選", noMatchingNodes: "沒有符合的節點", cdnDefaultType: "預設類型", defaultInterval: "預設間隔", seconds: "秒", addToImport: "加入匯入清單", selectCdn: "請至少選擇一個 CDN 節點。", invalidInterval: "預設間隔必須是大於 0 的整數。", editTitle: "批次編輯 ({count})", changeInterval: "修改監測間隔", changeServers: "修改應用伺服器", saveChanges: "儲存修改", saving: "儲存中...", atLeastOneChange: "至少選擇一項要修改的欄位。", intervalPositive: "間隔必須是大於 0 的整數。", nonDefaultServerRequired: "非預設任務不能設定為空伺服器清單。", deleteTitle: "刪除 {count} 個任務", deleteWarning: "刪除後會同時清理這些任務的延遲歷史記錄，此操作無法復原。", confirmDelete: "確認刪除", deleting: "刪除中...",
  },
  ja: {
    close: "閉じる", select: "選択", selected: "選択", selectedOf: "選択済み {selected} / 全 {total}", all: "すべて", success: "成功", error: "エラー", done: "完了", search: "検索", refresh: "更新", refreshing: "更新中...", importTasks: "タスクをインポート", pluginEyebrow: "Komari プラグイン", pageTitle: "遅延タスク一括管理", pageSubtitle: "監視タスクをまとめて管理します。", taskCount: "{count} 件のタスク", selectedCount: "選択済み {count}", loadingTasks: "タスクを読み込み中...", noTasks: "遅延タスクはありません", noTasksHint: "「タスクをインポート」から一括作成できます。", importTitle: "遅延タスクをインポート", confirmTitle: "インポートの確認", preview: "プレビュー", pendingSummary: "待機中 {pending} 件、エラー {failed} 件", name: "名前", target: "対象", type: "種類", interval: "間隔", status: "状態", note: "備考", pending: "待機中", server: "サーバー", serverCount: "{count} 件選択", defaultOn: "デフォルトで有効化", serverHelper: "有効にすると、新しいサーバーでこの監視を自動的に有効化します。既存サーバーには影響しません。", importFile: "ファイルをインポート", quickCdn: "クイックインポート", startImport: "インポート開始", importing: "インポート中...", cancel: "キャンセル", confirmImport: "インポートを確定", noValidTasks: "インポートできる有効なタスクがありません。", selectServer: "サーバーを1台以上選択するか、デフォルト適用を有効にしてください。", addedCdn: "CDN ノードを {count} 件追加しました（{type} / {interval}s）。テキストエリアで編集できます。", importComplete: "インポート完了：成功 {success} 件、失敗 {failed} 件。", importCompleteShort: "インポート完了：成功 {success} 件。", fileFormats: "TXT / JSON / CSV ファイルに対応", dataSource: "データソース：lf3-ips.zstaticcdn.com", inputHint: "各行：name, target, type, interval。JSON オブジェクトまたは配列にも対応します。区切り文字はカンマ、ハイフン、縦線です。", cdnLevel: "ノードレベル", provinceNodes: "省レベルノード", cityNodes: "市レベルノード", provinceProtocol: "省レベルプロトコル", searchCdn: "省・市またはノードアドレスを検索", shownNodes: "{visible} / {total} ノードを表示、{selected} 件選択", selectAllResults: "表示結果をすべて選択", deselectAllResults: "すべて解除", noMatchingNodes: "一致するノードはありません", cdnDefaultType: "デフォルト種類", defaultInterval: "デフォルト間隔", seconds: "秒", addToImport: "インポート一覧に追加", selectCdn: "CDN ノードを1つ以上選択してください。", invalidInterval: "デフォルト間隔は0より大きい整数にしてください。", editTitle: "{count} 件を一括編集", changeInterval: "監視間隔を変更", changeServers: "適用サーバーを変更", saveChanges: "変更を保存", saving: "保存中...", atLeastOneChange: "変更する項目を1つ以上選択してください。", intervalPositive: "間隔は0より大きい整数にしてください。", nonDefaultServerRequired: "デフォルトでないタスクのサーバー一覧は空にできません。", deleteTitle: "{count} 件を削除", deleteWarning: "遅延履歴も削除され、元に戻せません。", confirmDelete: "削除を確認", deleting: "削除中...",
  },
  id: {
    close: "Tutup", select: "Pilih", selected: "dipilih", selectedOf: "Dipilih {selected} / total {total}", all: "Semua", success: "Berhasil", error: "Kesalahan", done: "Selesai", search: "Cari", refresh: "Segarkan", refreshing: "Menyegarkan...", importTasks: "Impor tugas", pluginEyebrow: "Plugin Komari", pageTitle: "Manajemen massal tugas ping", pageSubtitle: "Kelola tugas pemantauan di satu tempat.", taskCount: "{count} tugas", selectedCount: "Dipilih {count}", loadingTasks: "Memuat tugas...", noTasks: "Belum ada tugas ping", noTasksHint: "Gunakan “Impor tugas” untuk membuatnya sekaligus.", importTitle: "Impor tugas ping", confirmTitle: "Konfirmasi impor", preview: "Pratinjau", pendingSummary: "{pending} menunggu, {failed} kesalahan", name: "Nama", target: "Target", type: "Tipe", interval: "Interval", status: "Status", note: "Catatan", pending: "Menunggu", server: "Server", serverCount: "{count} dipilih", defaultOn: "Aktifkan secara default", serverHelper: "Server baru akan otomatis memakai pemantauan ini; server yang ada tidak terpengaruh.", importFile: "Impor file", quickCdn: "Impor cepat", startImport: "Mulai impor", importing: "Mengimpor...", cancel: "Batal", confirmImport: "Konfirmasi impor", noValidTasks: "Tidak ada tugas valid untuk diimpor.", selectServer: "Pilih setidaknya satu server atau aktifkan opsi default.", addedCdn: "Menambahkan {count} node CDN ({type} / {interval}s). Anda dapat mengeditnya di area teks.", importComplete: "Impor selesai: {success} berhasil, {failed} gagal.", importCompleteShort: "Impor selesai: {success} berhasil.", fileFormats: "Mendukung file TXT / JSON / CSV", dataSource: "Sumber data: lf3-ips.zstaticcdn.com", inputHint: "Setiap baris: name, target, type, interval; objek atau array JSON juga didukung. Pemisah: koma, tanda hubung, atau garis vertikal.", cdnLevel: "Tingkat node", provinceNodes: "Node provinsi", cityNodes: "Node kota", provinceProtocol: "Protokol provinsi", shownNodes: "Menampilkan {visible} / {total} node, {selected} dipilih", selectAllResults: "Pilih semua hasil", deselectAllResults: "Batalkan semua pilihan", noMatchingNodes: "Tidak ada node yang cocok", cdnDefaultType: "Tipe default", defaultInterval: "Interval default", seconds: "dtk", addToImport: "Tambahkan ke daftar impor", selectCdn: "Pilih setidaknya satu node CDN.", invalidInterval: "Interval default harus berupa bilangan bulat lebih besar dari 0.", editTitle: "Edit {count} tugas", changeInterval: "Ubah interval", changeServers: "Ubah server aplikasi", saveChanges: "Simpan perubahan", saving: "Menyimpan...", atLeastOneChange: "Pilih setidaknya satu bidang untuk diubah.", intervalPositive: "Interval harus berupa bilangan bulat lebih besar dari 0.", nonDefaultServerRequired: "Tugas non-default tidak boleh memiliki daftar server kosong.", deleteTitle: "Hapus {count} tugas", deleteWarning: "Riwayat latensi juga akan dihapus dan tidak dapat dibatalkan.", confirmDelete: "Konfirmasi penghapusan", deleting: "Menghapus...",
  },
};

const supplemental = {
  en: {
    importResult: "Import results", servers: "Servers", defaultEnabled: "Enabled by default", selectAll: "Select all", retry: "Retry", unnamedTask: "Unnamed task", appServers: "Application servers", deleteDone: "Selected ping tasks deleted.", editDone: "Batch changes saved.", taskUnit: "tasks", editTasks: "Edit", deleteTasks: "Delete", sampleLine: "Google DNS, 8.8.8.8, icmp, 60", sampleJson: "[ { \"name\": \"Cloudflare\", \"target\": \"1.1.1.1\", \"type\": \"icmp\", \"interval\": 60 } ]", dualStack: "Dual stack",
  },
  "zh-CN": {
    importResult: "导入结果", servers: "服务器", defaultEnabled: "默认开启", selectAll: "全选", retry: "重试", unnamedTask: "未命名任务", appServers: "应用服务器", deleteDone: "已删除选中的延迟任务", editDone: "批量修改已保存", taskUnit: "个任务", editTasks: "批量编辑", deleteTasks: "批量删除", sampleLine: "Google DNS, 8.8.8.8, icmp, 60", sampleJson: "[ { \"name\": \"Cloudflare\", \"target\": \"1.1.1.1\", \"type\": \"icmp\", \"interval\": 60 } ]", dualStack: "双栈",
  },
  "zh-TW": {
    importResult: "匯入結果", servers: "伺服器", defaultEnabled: "預設開啟", selectAll: "全選", retry: "重試", unnamedTask: "未命名任務", appServers: "應用伺服器", deleteDone: "已刪除選取的延遲任務", editDone: "批次修改已儲存", taskUnit: "個任務", editTasks: "批次編輯", deleteTasks: "批次刪除", sampleLine: "Google DNS, 8.8.8.8, icmp, 60", sampleJson: "[ { \"name\": \"Cloudflare\", \"target\": \"1.1.1.1\", \"type\": \"icmp\", \"interval\": 60 } ]", dualStack: "雙棧",
  },
  ja: {
    importResult: "インポート結果", servers: "サーバー", defaultEnabled: "デフォルトで有効化", selectAll: "すべて選択", retry: "再試行", unnamedTask: "名前なしタスク", appServers: "適用サーバー", deleteDone: "選択した遅延タスクを削除しました", editDone: "一括変更を保存しました", taskUnit: "件のタスク", editTasks: "一括編集", deleteTasks: "一括削除", sampleLine: "Google DNS, 8.8.8.8, icmp, 60", sampleJson: "[ { \"name\": \"Cloudflare\", \"target\": \"1.1.1.1\", \"type\": \"icmp\", \"interval\": 60 } ]", dualStack: "デュアルスタック",
  },
  id: {
    importResult: "Hasil impor", servers: "Server", defaultEnabled: "Aktifkan secara default", selectAll: "Pilih semua", retry: "Coba lagi", unnamedTask: "Tugas tanpa nama", appServers: "Server aplikasi", deleteDone: "Tugas ping yang dipilih telah dihapus.", editDone: "Perubahan massal telah disimpan.", taskUnit: "tugas", editTasks: "Edit", deleteTasks: "Hapus", sampleLine: "Google DNS, 8.8.8.8, icmp, 60", sampleJson: "[ { \"name\": \"Cloudflare\", \"target\": \"1.1.1.1\", \"type\": \"icmp\", \"interval\": 60 } ]", dualStack: "Dual stack",
  },
};
Object.entries(supplemental).forEach(([locale, values]) => Object.assign(messages[locale], values));

const storageMessages = {
  en: {
    editServers: "Edit application servers",
    none: "None",
    storageEstimate: "Estimated storage usage",
    storageEstimateBasis: "Based on {tasks} tasks and {pairs} task-server links, at {bytes} B per ping.",
    storageEstimateNote: "Estimate only. Actual usage varies with metric-store retention, rollups, compression and database engine.",
    day: "day",
  },
  "zh-CN": {
    editServers: "修改应用服务器",
    none: "无",
    storageEstimate: "预计存储占用",
    storageEstimateBasis: "按 {tasks} 个任务、{pairs} 个任务-服务器关联，以及每次检测 {bytes} B 估算。",
    storageEstimateNote: "仅供估算。实际占用取决于 metric store 的保留策略、汇总、压缩方式和数据库类型。",
    day: "天",
  },
  "zh-TW": {
    editServers: "修改應用伺服器",
    none: "無",
    storageEstimate: "預計儲存用量",
    storageEstimateBasis: "依 {tasks} 個任務、{pairs} 個任務-伺服器關聯，以及每次檢測 {bytes} B 估算。",
    storageEstimateNote: "僅供估算。實際用量取決於 metric store 的保留策略、彙總、壓縮方式與資料庫類型。",
    day: "天",
  },
  ja: {
    editServers: "適用サーバーを編集",
    none: "なし",
    storageEstimate: "推定ストレージ使用量",
    storageEstimateBasis: "{tasks} 件のタスク、{pairs} 件のタスクとサーバーの関連、1 回 {bytes} B として算出。",
    storageEstimateNote: "推定値です。実際の使用量は metric store の保持、集計、圧縮、データベース種別で変わります。",
    day: "日",
  },
  id: {
    editServers: "Edit server aplikasi",
    none: "Tidak ada",
    storageEstimate: "Perkiraan penggunaan penyimpanan",
    storageEstimateBasis: "Berdasarkan {tasks} tugas, {pairs} relasi tugas-server, dan {bytes} B per ping.",
    storageEstimateNote: "Hanya perkiraan. Penggunaan aktual bergantung pada retensi, rollup, kompresi, dan jenis basis data metric store.",
    day: "hari",
  },
};
Object.entries(storageMessages).forEach(([locale, values]) => Object.assign(messages[locale], values));

const orderingMessages = {
  en: { reorderTask: "Reorder task", orderSaved: "Task order saved.", dragInstructions: "Use Space or Enter to pick up a task, arrow keys to move it, and Space or Enter to drop it. Press Escape to cancel.", dragPicked: "Picked up {name}.", dragMoved: "Moved to position {position}.", dragDropped: "Task placed.", dragCancelled: "Task movement cancelled." },
  "zh-CN": { reorderTask: "拖动调整任务顺序", orderSaved: "任务顺序已保存。", dragInstructions: "按空格或回车键抓取任务，使用方向键移动，按空格或回车键放置，按 Esc 取消。", dragPicked: "已抓取{name}。", dragMoved: "已移动到第 {position} 项。", dragDropped: "任务已放置。", dragCancelled: "已取消任务移动。" },
  "zh-TW": { reorderTask: "拖動調整任務順序", orderSaved: "任務順序已儲存。", dragInstructions: "按空白鍵或 Enter 鍵抓取任務，使用方向鍵移動，按空白鍵或 Enter 鍵放置，按 Esc 取消。", dragPicked: "已抓取{name}。", dragMoved: "已移動到第 {position} 項。", dragDropped: "任務已放置。", dragCancelled: "已取消任務移動。" },
  ja: { reorderTask: "タスクの順序を変更", orderSaved: "タスクの順序を保存しました。", dragInstructions: "Space または Enter でタスクをつかみ、矢印キーで移動します。もう一度 Space または Enter で配置、Esc でキャンセルします。", dragPicked: "{name} をつかみました。", dragMoved: "{position} 番目に移動しました。", dragDropped: "タスクを配置しました。", dragCancelled: "タスクの移動をキャンセルしました。" },
  id: { reorderTask: "Ubah urutan tugas", orderSaved: "Urutan tugas disimpan.", dragInstructions: "Tekan Spasi atau Enter untuk mengambil tugas, gunakan tombol panah untuk memindahkan, lalu tekan Spasi atau Enter untuk meletakkan. Tekan Esc untuk membatalkan.", dragPicked: "{name} dipilih.", dragMoved: "Dipindahkan ke posisi {position}.", dragDropped: "Tugas diletakkan.", dragCancelled: "Pemindahan tugas dibatalkan." },
};
Object.entries(orderingMessages).forEach(([locale, values]) => Object.assign(messages[locale], values));

const interpolate = (value, vars = {}) => value.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));

export const normalizeLocale = (value) => {
  const normalized = String(value || "").trim().replace(/_/g, "-").toLowerCase();
  if (normalized.startsWith("zh-tw") || normalized.startsWith("zh-hk") || normalized.startsWith("zh-mo")) return "zh-TW";
  if (normalized.startsWith("zh")) return "zh-CN";
  if (normalized.startsWith("ja")) return "ja";
  if (normalized.startsWith("id")) return "id";
  return "en";
};

export const readHostLocale = () => {
  const values = [];
  try { values.push(window.parent.document.documentElement.lang); } catch {}
  try { values.push(window.parent.localStorage.getItem("language")); } catch {}
  try { values.push(window.localStorage.getItem("language")); } catch {}
  try { values.push(document.documentElement.lang); } catch {}
  try { values.push(navigator.language); } catch {}
  return normalizeLocale(values.find(Boolean));
};

const LocaleContext = React.createContext("en");

export function LocaleProvider({ children }) {
  const [locale, setLocale] = React.useState(readHostLocale);
  React.useEffect(() => {
    const update = () => setLocale(readHostLocale());
    let observer;
    try {
      observer = new MutationObserver(update);
      observer.observe(window.parent.document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    } catch {}
    const timer = window.setInterval(update, 500);
    window.addEventListener("storage", update);
    return () => { observer?.disconnect(); window.clearInterval(timer); window.removeEventListener("storage", update); };
  }, []);
  return React.createElement(LocaleContext.Provider, { value: locale }, children);
}

export function useT() {
  const locale = React.useContext(LocaleContext);
  return React.useCallback((key, vars) => interpolate(messages[locale]?.[key] ?? messages.en[key] ?? key, vars), [locale]);
}
