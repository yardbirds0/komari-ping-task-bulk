import React from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { CDN_CITIES, CDN_PROVINCES } from "./cdn-data.js";
import { parseImportText } from "./parser.js";
import "./style.css";

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.status === "error") {
    throw new Error(body?.message || body?.error || `请求失败 (${response.status})`);
  }
  return body?.data ?? body?.result ?? body;
};

const idOf = (client) => client?.uuid || client?.UUID || client?.id || "";
const clientName = (client) => client?.name || client?.hostname || client?.remark || idOf(client);

function Modal({ title, children, onClose, wide = false, nested = false, variant = "", compact = false }) {
  return createPortal((
    <div className={`modal-backdrop ${nested ? "modal-backdrop-nested" : ""}`} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal ${wide ? "modal-wide" : ""} ${compact ? "modal-compact" : ""} ${variant ? `modal-${variant}` : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <h2>{title}</h2>
          <div className="modal-header-actions"><button className="icon-button" title="关闭" aria-label="关闭" onClick={onClose}>×</button></div>
        </div>
        {children}
      </section>
    </div>
  ), document.body);
}

function ServerSelectModal({ clients, selected, onClose, onDone }) {
  const [draft, setDraft] = React.useState(selected);
  const [query, setQuery] = React.useState("");
  const visible = clients.filter((client) => clientName(client).toLowerCase().includes(query.trim().toLowerCase()));
  const visibleIds = visible.map(idOf);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => draft.includes(id));
  const toggle = (id) => setDraft((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleAll = () => setDraft((current) => allSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])]);
  return (
    <Modal title="选择" onClose={onClose} nested compact>
      <div className="modal-body server-select-body">
        <div className="server-select-summary"><span>已选 {draft.length} / 共 {clients.length}</span><button type="button" className="button secondary" disabled={!visible.length} onClick={toggleAll}>全选</button></div>
        <div className="server-select-search-wrap"><span className="server-search-icon" aria-hidden="true" /><input className="text-input server-select-search" type="search" aria-label="搜索" placeholder="搜索" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <div className="server-select-table-wrap"><table className="server-select-table"><thead><tr><th className="check-cell"><input type="checkbox" aria-label="全选" checked={allSelected} onChange={toggleAll} disabled={!visible.length} /></th><th>服务器</th></tr></thead><tbody>{visible.map((client) => { const id = idOf(client); return <tr key={id}><td className="check-cell"><input type="checkbox" aria-label={`选择 ${clientName(client)}`} checked={draft.includes(id)} onChange={() => toggle(id)} /></td><td>{clientName(client)}</td></tr>; })}</tbody></table></div>
        <div className="server-select-footer"><span>{draft.length}选择</span><div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>取消</button><button type="button" className="button primary" onClick={() => onDone(draft)}>完毕</button></div></div>
      </div>
    </Modal>
  );
}

function ClientPicker({ clients, selected, onChange, onDismiss }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <div className="client-picker"><div className="server-picker-trigger"><button type="button" className="button primary server-select-trigger" onClick={() => setOpen(true)}>选择</button><span>{selected.length}选择</span></div></div>
      {open && <ServerSelectModal clients={clients} selected={selected} onClose={() => { setOpen(false); onDismiss?.(); }} onDone={(next) => { onChange(next); setOpen(false); }} />}
    </>
  );
}

const CDN_PROTOCOLS = [
  ["v4", "IPv4"],
  ["v6", "IPv6"],
  ["dualstack", "双栈"],
];

const cdnTargetForProtocol = (target, protocol) =>
  protocol === "v4" ? target : target.replace("-v4.", `-${protocol}.`);

function CdnPicker({ onClose, onApply }) {
  const [level, setLevel] = React.useState("province");
  const [protocol, setProtocol] = React.useState("v4");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState([]);
  const [error, setError] = React.useState("");
  const [cdnType, setCdnType] = React.useState("tcp");
  const [cdnInterval, setCdnInterval] = React.useState("60");
  const items = React.useMemo(() => {
    if (level === "province") {
      return CDN_PROVINCES.flatMap((group) =>
        group.nodes.map((node) => ({
          ...node,
          group: group.name,
          id: `${group.name}:${node.target}`,
          target: cdnTargetForProtocol(node.target, protocol),
        })),
      );
    }
    return CDN_CITIES.map((node) => ({ ...node, id: node.target }));
  }, [level, protocol]);
  const visible = items.filter((item) => `${item.name} ${item.target}`.toLowerCase().includes(query.trim().toLowerCase()));
  const resetSelection = (nextLevel) => {
    setLevel(nextLevel);
    setSelected([]);
    setQuery("");
    setError("");
  };
  const toggle = (id) => setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  const toggleAll = () => {
    const ids = visible.map((item) => item.id);
    const allSelected = ids.length > 0 && ids.every((id) => selected.includes(id));
    setSelected((current) => allSelected ? current.filter((id) => !ids.includes(id)) : [...new Set([...current, ...ids])]);
  };
  const apply = () => {
    const chosen = items.filter((item) => selected.includes(item.id));
    if (!chosen.length) return setError("请至少选择一个 CDN 节点。");
    const interval = Number(cdnInterval);
    if (!Number.isInteger(interval) || interval <= 0) return setError("默认间隔必须是大于 0 的整数。");
    onApply(chosen, { type: cdnType, interval });
  };
  return (
    <Modal title="快捷导入运营商 CDN" onClose={onClose} wide nested>
      <div className="modal-body cdn-picker-body">
        <div className="cdn-controls">
          <div className="segmented" aria-label="节点级别">
            <button type="button" className={level === "province" ? "active" : ""} onClick={() => resetSelection("province")}>省级节点</button>
            <button type="button" className={level === "city" ? "active" : ""} onClick={() => resetSelection("city")}>市级节点</button>
          </div>
          {level === "province" && <div className="segmented" aria-label="省级协议">{CDN_PROTOCOLS.map(([value, label]) => <button type="button" className={protocol === value ? "active" : ""} key={value} onClick={() => { setProtocol(value); setSelected([]); }}>{label}</button>)}</div>}
          <input className="text-input cdn-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索省份、城市或节点地址" />
        </div>
        <div className="cdn-summary"><span>当前显示 {visible.length} / {items.length} 个节点，已选 {selected.length}</span><button type="button" className="button secondary" disabled={!visible.length} onClick={toggleAll}>{visible.length > 0 && visible.every((item) => selected.includes(item.id)) ? "取消全选" : "全选当前结果"}</button></div>
        <div className="cdn-list">{visible.length ? visible.map((item) => <label className={`cdn-option ${selected.includes(item.id) ? "selected" : ""}`} key={item.id}><input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} /><span><strong>{item.name}</strong><code>{item.target}</code></span></label>) : <div className="empty-inline">没有匹配的节点</div>}</div>
        {error && <div className="notice error">{error}</div>}
        <div className="modal-actions modal-actions-split cdn-actions"><div className="cdn-defaults"><label>快捷导入默认类型<select aria-label="CDN 默认类型" value={cdnType} onChange={(event) => setCdnType(event.target.value)}><option value="icmp">ICMP</option><option value="tcp">TCP</option><option value="http">HTTP</option></select></label><label>默认间隔<input aria-label="CDN 默认间隔" type="number" min="1" step="1" value={cdnInterval} onChange={(event) => setCdnInterval(event.target.value)} /> 秒</label></div><div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>取消</button><button type="button" className="button primary" disabled={!selected.length} onClick={apply}>加入导入列表</button></div></div>
      </div>
    </Modal>
  );
}

function ImportConfirmModal({ rows, onClose, onConfirm, running }) {
  const [filter, setFilter] = React.useState("all");
  const pending = rows.filter((row) => row.status === "pending");
  const failed = rows.filter((row) => row.status === "failed");
  const visible = rows.filter((row) => filter === "all" || row.status === filter);
  return (
    <Modal title="确认导入" onClose={onClose} wide nested variant="import-confirm">
      <div className="modal-body import-confirm-body">
        <div className="preview confirm-preview">
          <div className="preview-head"><strong>预览</strong><span>{pending.length} 条待导入，{failed.length} 条错误</span></div>
          <div className="preview-table-wrap"><table><thead><tr><th>#</th><th>名称</th><th>目标</th><th>类型</th><th>间隔</th><th>状态</th><th>备注</th></tr></thead><tbody>{visible.map((row, index) => <tr key={`${row.row}-${index}`}><td>{row.row}</td><td>{row.name || "-"}</td><td>{row.target || "-"}</td><td>{row.type || "-"}</td><td>{row.interval || "-"}</td><td><span className={`status ${row.status}`}>{row.status === "pending" ? "待导入" : row.status === "success" ? "成功" : "错误"}</span></td><td>{row.message || ""}{row.near && <code>{row.near}</code>}</td></tr>)}</tbody></table></div>
          <div className="filter-row">{[["all", "全部"], ["success", "成功"], ["failed", "错误"]].map(([value, label]) => <button key={value} className={`filter ${filter === value ? "active" : ""}`} onClick={() => setFilter(value)}>{label}</button>)}</div>
        </div>
        <div className="modal-actions"><button type="button" className="button secondary" disabled={running} onClick={onClose}>取消</button><button type="button" className="button primary" disabled={running || !pending.length} onClick={onConfirm}>{running ? "导入中..." : "确定导入"}</button></div>
      </div>
    </Modal>
  );
}

function ImportModal({ clients, onClose, onImported }) {
  const [text, setText] = React.useState("");
  const [selectedClients, setSelectedClients] = React.useState([]);
  const [defaultOn, setDefaultOn] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [notice, setNotice] = React.useState("");
  const [cdnOpen, setCdnOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const parsed = React.useMemo(() => parseImportText(text), [text]);
  const pending = parsed.filter((row) => row.status === "pending");
  const appendCdnRows = (nodes, defaults) => {
    const rows = nodes.map((node) => `${node.name},${node.target},${defaults.type},${defaults.interval}`).join("\n");
    setText((current) => current.trim() ? `${current.trim()}\n${rows}` : rows);
    setNotice(`已加入 ${nodes.length} 个 CDN 节点（${defaults.type.toUpperCase()} / ${defaults.interval}s），可在文本框中继续调整。`);
    setCdnOpen(false);
  };

  const openConfirmation = () => {
    if (!pending.length) return setNotice("没有可以导入的有效任务。");
    if (!defaultOn && !selectedClients.length) return setNotice("请至少选择一个服务器，或开启默认应用。");
    setNotice("");
    setConfirmOpen(true);
  };

  const importRows = async () => {
    setRunning(true);
    let success = 0;
    let failures = 0;
    for (const row of pending) {
      try {
        await request("/api/admin/ping/add", {
          method: "POST",
          body: JSON.stringify({ name: row.name, target: row.target, type: row.type, interval: row.interval, default_on: defaultOn, clients: selectedClients }),
        });
        success += 1;
      } catch (error) {
        failures += 1;
      }
    }
    setRunning(false);
    setConfirmOpen(false);
    onClose();
    if (success || failures) onImported({ success, failures });
  };

  return (
    <Modal title="导入延迟任务" onClose={onClose} wide variant="import-form">
      <div className="modal-body import-modal-body empty-import">
        <textarea className="import-text" rows="9" value={text} onChange={(event) => { setText(event.target.value); setNotice(""); }} placeholder={'Google DNS,8.8.8.8,icmp,60\n[ { "name": "Cloudflare", "target": "1.1.1.1", "type": "icmp", "interval": 60 } ]\n\n每行格式：name, target, type, interval；也支持 JSON 对象或数组。分隔符可用逗号、短横线或竖线。'} />
        <div className="server-field"><label>服务器</label><ClientPicker clients={clients} selected={selectedClients} onChange={setSelectedClients} onDismiss={onClose} /><label className="server-default-row"><input type="checkbox" checked={defaultOn} onChange={(event) => setDefaultOn(event.target.checked)} /><span>默认开启</span></label><div className="server-helper">开启后，新加入的服务器会自动启用此监测；已存在的服务器不受影响。</div></div>
        {notice && <div className={`notice ${notice.includes("完成") && !notice.includes("失败 0") ? "warning" : "info"}`}>{notice}</div>}
        <div className="modal-actions modal-actions-split"><div className="modal-actions import-left-actions"><div className="file-open-wrap"><label className="button success file-button">导入文件<input type="file" accept=".json,.txt,.csv,application/json,text/plain,text/csv" onChange={(event) => event.target.files?.[0]?.text().then((value) => { setText(value); setNotice(""); })} /></label><span className="file-info"><button type="button" className="info-button" aria-label="支持的文件格式" title="支持的文件格式">i</button><span className="modal-tooltip" role="tooltip">支持 TXT / JSON / CSV 文件</span></span></div><div className="cdn-open-wrap"><button className="button secondary cdn-open-button" onClick={() => setCdnOpen(true)}>快捷导入运营商 CDN</button><span className="cdn-info"><button type="button" className="info-button" aria-label="数据来源" title="数据来源">i</button><span className="modal-tooltip" role="tooltip"><span>数据来源：</span><a href="https://lf3-ips.zstaticcdn.com/" target="_blank" rel="noreferrer">lf3-ips.zstaticcdn.com</a></span></span></div></div><div className="modal-actions"><button className="button secondary" onClick={onClose}>取消</button><button className="button primary" disabled={running || !pending.length} onClick={openConfirmation}>开始导入</button></div></div>
      </div>
      {cdnOpen && <CdnPicker onClose={onClose} onApply={appendCdnRows} />}
      {confirmOpen && <ImportConfirmModal rows={parsed} running={running} onClose={onClose} onConfirm={importRows} />}
    </Modal>
  );
}

function EditModal({ tasks, clients, onClose, onSaved }) {
  const [changeInterval, setChangeInterval] = React.useState(false);
  const [interval, setIntervalValue] = React.useState("60");
  const [changeClients, setChangeClients] = React.useState(false);
  const [selectedClients, setSelectedClients] = React.useState([]);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const save = async () => {
    const value = Number(interval);
    if (!changeInterval && !changeClients) return setError("至少选择一项要修改的字段。");
    if (changeInterval && (!Number.isInteger(value) || value <= 0)) return setError("间隔必须是大于 0 的整数。");
    if (changeClients && !selectedClients.length && tasks.some((task) => !task.default_on)) return setError("非默认任务不能设置为空服务器列表。");
    setSaving(true); setError("");
    try {
      await request("/api/admin/ping/edit", { method: "POST", body: JSON.stringify({ tasks: tasks.map((task) => ({ id: task.id, name: task.name, type: task.type, target: task.target, default_on: task.default_on, clients: changeClients ? selectedClients : task.clients || [], interval: changeInterval ? value : task.interval })) }) });
      onSaved();
    } catch (caught) { setError(caught.message); } finally { setSaving(false); }
  };
  return <Modal title={`批量编辑 (${tasks.length})`} onClose={onClose}><div className="modal-body"><label className="switch-row"><input type="checkbox" checked={changeInterval} onChange={(event) => setChangeInterval(event.target.checked)} /><span>修改监测间隔</span></label><input className="text-input" type="number" min="1" value={interval} disabled={!changeInterval} onChange={(event) => setIntervalValue(event.target.value)} /><label className="switch-row"><input type="checkbox" checked={changeClients} onChange={(event) => setChangeClients(event.target.checked)} /><span>修改应用服务器</span></label><div className={!changeClients ? "disabled-block" : ""}><ClientPicker clients={clients} selected={selectedClients} onChange={setSelectedClients} /></div>{error && <div className="notice error">{error}</div>}<div className="modal-actions"><button className="button secondary" onClick={onClose}>取消</button><button className="button primary" disabled={saving} onClick={save}>{saving ? "保存中..." : "保存修改"}</button></div></div></Modal>;
}

function DeleteModal({ count, onClose, onConfirm, deleting }) {
  return <Modal title={`删除 ${count} 个任务`} onClose={onClose}><div className="modal-body"><p>删除后会同时清理这些任务的历史延迟记录，此操作不可撤销。</p><div className="modal-actions"><button className="button secondary" onClick={onClose}>取消</button><button className="button danger" disabled={deleting} onClick={onConfirm}>{deleting ? "删除中..." : "确认删除"}</button></div></div></Modal>;
}

function App() {
  const [tasks, setTasks] = React.useState([]);
  const [clients, setClients] = React.useState([]);
  const [selected, setSelected] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [modal, setModal] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const [toast, setToast] = React.useState("");

  const load = React.useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const [taskData, clientData] = await Promise.all([request("/api/admin/ping/"), request("/api/admin/client/list")]);
      setTasks(Array.isArray(taskData) ? taskData : []);
      setClients(Array.isArray(clientData) ? clientData : []);
      setSelected((current) => current.filter((id) => taskData.some((task) => task.id === id)));
    } catch (caught) { setError(caught.message); } finally { setLoading(false); setRefreshing(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);
  React.useEffect(() => { if (!toast) return undefined; const timer = setTimeout(() => setToast(""), 3000); return () => clearTimeout(timer); }, [toast]);
  React.useEffect(() => {
    const root = document.documentElement;
    const sync = () => root.classList.toggle("dark", window.parent?.document?.documentElement?.classList.contains("dark"));
    sync();
    const observer = window.parent && new MutationObserver(sync);
    observer?.observe(window.parent.document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer?.disconnect();
  }, []);

  const toggleAll = () => setSelected(selected.length === tasks.length ? [] : tasks.map((task) => task.id));
  const deleteSelected = async () => {
    setDeleting(true);
    try { await request("/api/admin/ping/delete", { method: "POST", body: JSON.stringify({ id: selected }) }); setSelected([]); setModal(""); setToast("已删除选中的延迟任务"); await load(true); } catch (caught) { setError(caught.message); } finally { setDeleting(false); }
  };
  const afterSaved = async (message) => { setModal(""); setSelected([]); setToast(message); await load(true); };

  return <main className="app-shell"><header className="page-header"><div><div className="eyebrow">Komari 插件</div><h1>延迟任务批量管理</h1><p>集中维护监测任务，减少重复操作。</p></div><div className="header-actions"><button className="button secondary" onClick={() => load(true)} disabled={refreshing}>{refreshing ? "刷新中..." : "刷新"}</button><button className="button primary" onClick={() => setModal("import")}>导入任务</button></div></header><section className="toolbar"><div><strong>{tasks.length}</strong><span className="muted"> 个任务</span>{selected.length > 0 && <span className="selection-count">已选 {selected.length}</span>}</div><div className="toolbar-actions">{selected.length > 0 && <><button className="button secondary" onClick={() => setModal("edit")}>批量编辑</button><button className="button danger" onClick={() => setModal("delete")}>批量删除</button></>}</div></section>{error && <div className="notice error">{error}<button onClick={() => load()}>重试</button></div>}{loading ? <div className="empty-state"><span className="spinner" />加载任务中...</div> : tasks.length === 0 ? <div className="empty-state"><strong>暂无延迟任务</strong><span>可以使用“导入任务”批量创建。</span></div> : <div className="table-card"><div className="table-wrap"><table><thead><tr><th className="check-cell"><input type="checkbox" checked={tasks.length > 0 && selected.length === tasks.length} onChange={toggleAll} aria-label="全选任务" /></th><th>名称</th><th>目标</th><th>类型</th><th>间隔</th><th>应用服务器</th></tr></thead><tbody>{tasks.map((task) => <tr key={task.id}><td className="check-cell"><input type="checkbox" checked={selected.includes(task.id)} onChange={() => setSelected(selected.includes(task.id) ? selected.filter((id) => id !== task.id) : [...selected, task.id])} aria-label={`选择 ${task.name}`} /></td><td><strong>{task.name || "未命名任务"}</strong><span className="subtext">#{task.id}</span></td><td className="mono">{task.target}</td><td><span className="type-badge">{String(task.type || "icmp").toUpperCase()}</span></td><td>{task.interval}s</td><td>{task.default_on ? <span className="default-badge">默认开启</span> : <span className="server-list">{(task.clients || []).length} 台服务器</span>}</td></tr>)}</tbody></table></div></div>}{toast && <div className="toast">{toast}</div>}{modal === "import" && <ImportModal clients={clients} onClose={() => setModal("")} onImported={() => { setToast("任务导入成功"); load(true); }} />}{modal === "edit" && <EditModal tasks={tasks.filter((task) => selected.includes(task.id))} clients={clients} onClose={() => setModal("")} onSaved={() => afterSaved("批量修改已保存")} />}{modal === "delete" && <DeleteModal count={selected.length} deleting={deleting} onClose={() => setModal("")} onConfirm={deleteSelected} />}</main>;
}

createRoot(document.getElementById("root")).render(<App />);
