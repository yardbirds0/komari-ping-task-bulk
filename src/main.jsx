import React from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { CDN_CITIES, CDN_PROVINCES } from "./cdn-data.js";
import { parseImportText } from "./parser.js";
import { LocaleProvider, useT } from "./i18n.js";
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

const ESTIMATED_BYTES_PER_PING = 190;
const IMPORT_CONCURRENCY = 4;

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** index);
  return `${Number(value.toFixed(2))} ${units[index]}`;
};

const getTaskServerCount = (task) => (Array.isArray(task.clients) ? task.clients : []).length;

const calculateStorageEstimate = (tasks) => {
  const taskServerPairs = tasks.reduce((total, task) => total + getTaskServerCount(task), 0);
  const recordsPerDay = tasks.reduce((total, task) => {
    const interval = Number(task.interval) > 0 ? Number(task.interval) : 60;
    return total + (getTaskServerCount(task) * 86400) / interval;
  }, 0);
  return { taskServerPairs, recordsPerDay, dailyBytes: recordsPerDay * ESTIMATED_BYTES_PER_PING };
};

function Modal({ title, children, onClose, wide = false, nested = false, variant = "", compact = false }) {
  const t = useT();
  return createPortal((
    <div className={`modal-backdrop ${nested ? "modal-backdrop-nested" : ""}`} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal ${wide ? "modal-wide" : ""} ${compact ? "modal-compact" : ""} ${variant ? `modal-${variant}` : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <h2>{title}</h2>
          <div className="modal-header-actions"><button className="icon-button" title={t("close")} aria-label={t("close")} onClick={onClose}>×</button></div>
        </div>
        {children}
      </section>
    </div>
  ), document.body);
}

function ServerSelectModal({ clients, selected, onClose, onDone }) {
  const t = useT();
  const [draft, setDraft] = React.useState(selected);
  const [query, setQuery] = React.useState("");
  const visible = clients.filter((client) => clientName(client).toLowerCase().includes(query.trim().toLowerCase()));
  const visibleIds = visible.map(idOf);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => draft.includes(id));
  const toggle = (id) => setDraft((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleAll = () => setDraft((current) => allSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])]);
  return (
    <Modal title={t("select")} onClose={onClose} nested compact>
      <div className="modal-body server-select-body">
        <div className="server-select-summary"><span>{t("selectedOf", { selected: draft.length, total: clients.length })}</span><button type="button" className="button secondary" disabled={!visible.length} onClick={toggleAll}>{t("selectAll")}</button></div>
        <div className="server-select-search-wrap"><span className="server-search-icon" aria-hidden="true" /><input className="text-input server-select-search" type="search" aria-label={t("search")} placeholder={t("search")} value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <div className="server-select-table-wrap"><table className="server-select-table"><thead><tr><th className="check-cell"><input type="checkbox" aria-label={t("selectAll")} checked={allSelected} onChange={toggleAll} disabled={!visible.length} /></th><th>{t("servers")}</th></tr></thead><tbody>{visible.map((client) => { const id = idOf(client); return <tr key={id}><td className="check-cell"><input type="checkbox" aria-label={`${t("select")} ${clientName(client)}`} checked={draft.includes(id)} onChange={() => toggle(id)} /></td><td>{clientName(client)}</td></tr>; })}</tbody></table></div>
        <div className="server-select-footer"><span>{t("serverCount", { count: draft.length })}</span><div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>{t("cancel")}</button><button type="button" className="button primary" onClick={() => onDone(draft)}>{t("done")}</button></div></div>
      </div>
    </Modal>
  );
}

function ClientPicker({ clients, selected, onChange, onDismiss }) {
  const t = useT();
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <div className="client-picker"><div className="server-picker-trigger"><button type="button" className="button primary server-select-trigger" onClick={() => setOpen(true)}>{t("select")}</button><span>{t("serverCount", { count: selected.length })}</span></div></div>
      {open && <ServerSelectModal clients={clients} selected={selected} onClose={() => { setOpen(false); onDismiss?.(); }} onDone={(next) => { onChange(next); setOpen(false); }} />}
    </>
  );
}

function TaskServerCell({ task, clients, onUpdated, onError }) {
  const t = useT();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const clientNames = React.useMemo(() => new Map(clients.map((client) => [idOf(client), clientName(client)])), [clients]);
  const serverIds = Array.isArray(task.clients) ? task.clients : [];
  const names = serverIds.map((id) => clientNames.get(id) || id).filter(Boolean);
  const display = names.length ? names.join(", ") : t("none");

  const save = async (nextClients) => {
    setSaving(true);
    try {
      await request("/api/admin/ping/edit", {
        method: "POST",
        body: JSON.stringify({
          tasks: [{
            id: task.id,
            name: task.name,
            type: task.type,
            target: task.target,
            default_on: task.default_on,
            clients: nextClients,
            interval: task.interval,
          }],
        }),
      });
      onUpdated(task.id, nextClients);
      setOpen(false);
    } catch (caught) {
      onError(caught?.message || t("error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <td>
      <div className="server-cell">
        <span className="server-names" title={display}>{display}</span>
        {task.default_on && <span className="default-badge">{t("defaultEnabled")}</span>}
        <button
          type="button"
          className="table-more-button"
          title={t("editServers")}
          aria-label={t("editServers")}
          disabled={saving}
          onClick={() => setOpen(true)}
        >
          ...
        </button>
      </div>
      {open && <ServerSelectModal clients={clients} selected={task.clients || []} onClose={() => setOpen(false)} onDone={save} />}
    </td>
  );
}

function StorageEstimate({ tasks }) {
  const t = useT();
  const estimate = React.useMemo(() => calculateStorageEstimate(tasks), [tasks]);
  return (
    <div className="storage-estimate">
      <div className="storage-estimate-main">
        <strong>{t("storageEstimate")}</strong>
        <span>{formatBytes(estimate.dailyBytes)} / {t("day")}</span>
      </div>
      <div className="storage-estimate-detail">
        {t("storageEstimateBasis", { tasks: tasks.length, pairs: estimate.taskServerPairs, bytes: ESTIMATED_BYTES_PER_PING })}
      </div>
      <div className="storage-estimate-note">{t("storageEstimateNote")}</div>
    </div>
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
  const t = useT();
  const [level, setLevel] = React.useState("province");
  const [protocol, setProtocol] = React.useState("v4");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState([]);
  const [error, setError] = React.useState("");
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
    if (!chosen.length) return setError(t("selectCdn"));
    const interval = Number(cdnInterval);
    if (!Number.isInteger(interval) || interval <= 0) return setError(t("invalidInterval"));
    onApply(chosen, { type: "tcp", interval });
  };
  return (
    <Modal title={t("quickCdn")} onClose={onClose} wide nested>
      <div className="modal-body cdn-picker-body">
        <div className="cdn-controls">
          <div className="segmented" aria-label={t("cdnLevel")}>
            <button type="button" className={level === "province" ? "active" : ""} onClick={() => resetSelection("province")}>{t("provinceNodes")}</button>
            <button type="button" className={level === "city" ? "active" : ""} onClick={() => resetSelection("city")}>{t("cityNodes")}</button>
          </div>
          {level === "province" && <div className="segmented" aria-label={t("provinceProtocol")}>{CDN_PROTOCOLS.map(([value, label]) => <button type="button" className={protocol === value ? "active" : ""} key={value} onClick={() => { setProtocol(value); setSelected([]); }}>{value === "dualstack" ? t("dualStack") : label}</button>)}</div>}
          <input className="text-input cdn-search" type="search" aria-label={t("searchCdn")} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchCdn")} />
        </div>
        <div className="cdn-summary"><span>{t("shownNodes", { visible: visible.length, total: items.length, selected: selected.length })}</span><button type="button" className="button secondary" disabled={!visible.length} onClick={toggleAll}>{visible.length > 0 && visible.every((item) => selected.includes(item.id)) ? t("deselectAllResults") : t("selectAllResults")}</button></div>
        <div className="cdn-list">{visible.length ? visible.map((item) => <label className={`cdn-option ${selected.includes(item.id) ? "selected" : ""}`} key={item.id}><input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} /><span><strong>{item.name}</strong><code>{item.target}</code></span></label>) : <div className="empty-inline">{t("noMatchingNodes")}</div>}</div>
        {error && <div className="notice error">{error}</div>}
        <div className="modal-actions modal-actions-split cdn-actions"><div className="cdn-defaults"><label>{t("cdnDefaultType")}<select aria-label={t("cdnDefaultType")} value="tcp" disabled><option value="tcp">TCP</option></select></label><label>{t("defaultInterval")}<input aria-label={t("defaultInterval")} type="number" min="1" step="1" value={cdnInterval} onChange={(event) => setCdnInterval(event.target.value)} /> {t("seconds")}</label></div><div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>{t("cancel")}</button><button type="button" className="button primary" disabled={!selected.length} onClick={apply}>{t("addToImport")}</button></div></div>
      </div>
    </Modal>
  );
}

function ImportConfirmModal({ rows, onClose, running }) {
  const t = useT();
  const [filter, setFilter] = React.useState("all");
  const pending = rows.filter((row) => row.status === "pending");
  const failed = rows.filter((row) => row.status === "failed");
  const visible = rows.filter((row) => filter === "all" || row.status === filter);
  const statusLabel = (status) => status === "pending" ? t("pending") : status === "success" ? t("success") : t("error");
  return (
    <Modal title={t("importResult")} onClose={onClose} wide nested variant="import-confirm">
      <div className="modal-body import-confirm-body">
        <div className="preview confirm-preview">
          <div className="preview-head"><strong>{t("preview")}</strong><span>{running ? t("pendingSummary", { pending: pending.length, failed: failed.length }) : t("importComplete", { success: rows.filter((row) => row.status === "success").length, failed: failed.length })}</span></div>
          <div className="preview-table-wrap"><table><thead><tr><th>#</th><th>{t("name")}</th><th>{t("target")}</th><th>{t("type")}</th><th>{t("interval")}</th><th>{t("status")}</th><th>{t("note")}</th></tr></thead><tbody>{visible.map((row, index) => <tr key={`${row.row}-${index}`}><td>{row.row}</td><td>{row.name || "-"}</td><td>{row.target || "-"}</td><td>{row.type || "-"}</td><td>{row.interval || "-"}</td><td><span className={`status ${row.status}`}>{statusLabel(row.status)}</span></td><td>{row.message || ""}{row.near && <code>{row.near}</code>}</td></tr>)}</tbody></table></div>
          <div className="filter-row">{[["all", t("all")], ["success", t("success")], ["failed", t("error")]].map(([value, label]) => <button type="button" key={value} className={`filter ${filter === value ? "active" : ""}`} onClick={() => setFilter(value)}>{label}</button>)}</div>
        </div>
        <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>{t("close")}</button></div>
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
  const [results, setResults] = React.useState([]);
  const t = useT();
  const parsed = React.useMemo(() => parseImportText(text), [text]);
  const pending = parsed.filter((row) => row.status === "pending");
  const appendCdnRows = (nodes, defaults) => {
    const rows = nodes.map((node) => `${node.name},${node.target},${defaults.type},${defaults.interval}`).join("\n");
    setText((current) => current.trim() ? `${current.trim()}\n${rows}` : rows);
    setNotice(t("addedCdn", { count: nodes.length, type: defaults.type.toUpperCase(), interval: defaults.interval }));
    setCdnOpen(false);
  };

  const openConfirmation = () => {
    if (!pending.length) return setNotice(t("noValidTasks"));
    if (!defaultOn && !selectedClients.length) return setNotice(t("selectServer"));
    setNotice("");
    const snapshot = parsed.map((row) => ({ ...row }));
    setResults(snapshot);
    setConfirmOpen(true);
    setRunning(true);
    void importRows(snapshot);
  };

  const importRows = async (rowsToImport) => {
    setRunning(true);
    let success = 0;
    let failures = rowsToImport.filter((row) => row.status === "failed").length;
    const pendingIndexes = rowsToImport.flatMap((row, index) => row.status === "pending" ? [index] : []);
    let nextIndex = 0;
    const worker = async () => {
      while (nextIndex < pendingIndexes.length) {
        const index = pendingIndexes[nextIndex++];
        const row = rowsToImport[index];
        try {
          await request("/api/admin/ping/add", {
            method: "POST",
            body: JSON.stringify({ name: row.name, target: row.target, type: row.type, interval: row.interval, default_on: defaultOn, clients: selectedClients }),
          });
          success += 1;
          setResults((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, status: "success", message: "", near: "" } : item));
        } catch (error) {
          failures += 1;
          setResults((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, status: "failed", message: error?.message || t("error") } : item));
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(IMPORT_CONCURRENCY, pendingIndexes.length) }, worker));
    setRunning(false);
    if (success || failures) onImported({ success, failures });
  };

  return (
    <Modal title={t("importTitle")} onClose={onClose} wide variant="import-form">
      <div className="modal-body import-modal-body empty-import">
        <textarea className="import-text" rows="9" value={text} onChange={(event) => { setText(event.target.value); setNotice(""); }} placeholder={`${t("sampleLine")}\n${t("sampleJson")}\n\n${t("inputHint")}`} />
        <div className="server-field"><label>{t("server")}</label><ClientPicker clients={clients} selected={selectedClients} onChange={setSelectedClients} onDismiss={onClose} /><label className="server-default-row"><input type="checkbox" checked={defaultOn} onChange={(event) => setDefaultOn(event.target.checked)} /><span>{t("defaultOn")}</span></label><div className="server-helper">{t("serverHelper")}</div></div>
        {notice && <div className={`notice ${notice.includes("完成") && !notice.includes("失败 0") ? "warning" : "info"}`}>{notice}</div>}
        <div className="modal-actions modal-actions-split"><div className="modal-actions import-left-actions"><div className="file-open-wrap"><label className="button success file-button">{t("importFile")}<input type="file" accept=".json,.txt,.csv,application/json,text/plain,text/csv" onChange={(event) => event.target.files?.[0]?.text().then((value) => { setText(value); setNotice(""); })} /></label><span className="file-info"><button type="button" className="info-button" aria-label={t("fileFormats")} title={t("fileFormats")}>i</button><span className="modal-tooltip" role="tooltip">{t("fileFormats")}</span></span></div><div className="cdn-open-wrap"><button type="button" className="button secondary cdn-open-button" onClick={() => setCdnOpen(true)}>{t("quickCdn")}</button><span className="cdn-info"><button type="button" className="info-button" aria-label={t("dataSource")} title={t("dataSource")}>i</button><span className="modal-tooltip" role="tooltip"><a href="https://lf3-ips.zstaticcdn.com/" target="_blank" rel="noreferrer">lf3-ips.zstaticcdn.com</a></span></span></div></div><div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>{t("cancel")}</button><button type="button" className="button primary" disabled={running || !pending.length} onClick={openConfirmation}>{t("startImport")}</button></div></div>
      </div>
      {cdnOpen && <CdnPicker onClose={onClose} onApply={appendCdnRows} />}
      {confirmOpen && <ImportConfirmModal rows={results} running={running} onClose={onClose} />}
    </Modal>
  );
}

function EditModal({ tasks, clients, onClose, onSaved }) {
  const t = useT();
  const [changeInterval, setChangeInterval] = React.useState(false);
  const [interval, setIntervalValue] = React.useState("60");
  const [changeClients, setChangeClients] = React.useState(false);
  const [selectedClients, setSelectedClients] = React.useState([]);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const save = async () => {
    const value = Number(interval);
    if (!changeInterval && !changeClients) return setError(t("atLeastOneChange"));
    if (changeInterval && (!Number.isInteger(value) || value <= 0)) return setError(t("intervalPositive"));
    if (changeClients && !selectedClients.length && tasks.some((task) => !task.default_on)) return setError(t("nonDefaultServerRequired"));
    setSaving(true); setError("");
    try {
      await request("/api/admin/ping/edit", { method: "POST", body: JSON.stringify({ tasks: tasks.map((task) => ({ id: task.id, name: task.name, type: task.type, target: task.target, default_on: task.default_on, clients: changeClients ? selectedClients : task.clients || [], interval: changeInterval ? value : task.interval })) }) });
      onSaved();
    } catch (caught) { setError(caught.message); } finally { setSaving(false); }
  };
  return <Modal title={t("editTitle", { count: tasks.length })} onClose={onClose}><div className="modal-body"><label className="switch-row"><input type="checkbox" checked={changeInterval} onChange={(event) => setChangeInterval(event.target.checked)} /><span>{t("changeInterval")}</span></label><input className="text-input" type="number" min="1" value={interval} disabled={!changeInterval} onChange={(event) => setIntervalValue(event.target.value)} /><label className="switch-row"><input type="checkbox" checked={changeClients} onChange={(event) => setChangeClients(event.target.checked)} /><span>{t("changeServers")}</span></label><div className={!changeClients ? "disabled-block" : ""}><ClientPicker clients={clients} selected={selectedClients} onChange={setSelectedClients} /></div>{error && <div className="notice error">{error}</div>}<div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>{t("cancel")}</button><button type="button" className="button primary" disabled={saving} onClick={save}>{saving ? t("saving") : t("saveChanges")}</button></div></div></Modal>;
}

function DeleteModal({ count, onClose, onConfirm, deleting }) {
  const t = useT();
  return <Modal title={t("deleteTitle", { count })} onClose={onClose}><div className="modal-body"><p>{t("deleteWarning")}</p><div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>{t("cancel")}</button><button type="button" className="button danger" disabled={deleting} onClick={onConfirm}>{deleting ? t("deleting") : t("confirmDelete")}</button></div></div></Modal>;
}

function TaskDragOverlay({ task, clients, style }) {
  const t = useT();
  const clientNames = React.useMemo(() => new Map(clients.map((client) => [idOf(client), clientName(client)])), [clients]);
  const names = (Array.isArray(task.clients) ? task.clients : []).map((id) => clientNames.get(id) || id).filter(Boolean);
  const display = names.length ? names.join(", ") : t("none");
  return (
    <div className="drag-overlay" role="presentation" style={style}>
      <div className="drag-overlay-cell drag-overlay-check" />
      <div className="drag-overlay-cell drag-overlay-handle"><span className="drag-handle-icon" aria-hidden="true"><span /><span /><span /></span></div>
      <div className="drag-overlay-cell drag-overlay-name"><strong>{task.name || t("unnamedTask")}</strong><span className="subtext">#{task.id}</span></div>
      <div className="drag-overlay-cell drag-overlay-servers"><span className="server-names">{display}</span>{task.default_on && <span className="default-badge">{t("defaultEnabled")}</span>}<span className="table-more-button" aria-hidden="true">...</span></div>
      <div className="drag-overlay-cell mono">{task.target}</div>
      <div className="drag-overlay-cell"><span className="type-badge">{String(task.type || "icmp").toUpperCase()}</span></div>
      <div className="drag-overlay-cell">{task.interval}s</div>
    </div>
  );
}

function TaskTable({ tasks, clients, selected, onSelectionChange, onTaskUpdated, onError, onReorder, ordering }) {
  const t = useT();
  const allSelected = tasks.length > 0 && selected.length === tasks.length;
  const rowRefs = React.useRef(new Map());
  const metricsRef = React.useRef(new Map());
  const dragRef = React.useRef(null);
  const [dragState, setDragState] = React.useState(null);
  const [liveMessage, setLiveMessage] = React.useState("");
  const toggleAll = () => onSelectionChange(allSelected ? [] : tasks.map((task) => task.id));
  const toggleTask = (id) => onSelectionChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  const dragMode = dragState?.mode || "";

  const measureRows = React.useCallback(() => {
    const metrics = new Map();
    tasks.forEach((task) => {
      const node = rowRefs.current.get(String(task.id));
      if (!node) return;
      const rect = node.getBoundingClientRect();
      metrics.set(String(task.id), { top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    });
    metricsRef.current = metrics;
    return metrics;
  }, [tasks]);

  const dropIndexForPointer = React.useCallback((clientY, sourceIndex, metrics = metricsRef.current) => {
    const remaining = tasks.filter((_, index) => index !== sourceIndex);
    for (let index = 0; index < remaining.length; index += 1) {
      const metric = metrics.get(String(remaining[index].id));
      if (metric && clientY < metric.top + metric.height / 2) return index;
    }
    return remaining.length;
  }, [tasks]);

  const startDrag = React.useCallback((mode, event, task) => {
    if (ordering || dragRef.current) return;
    const sourceIndex = tasks.findIndex((item) => String(item.id) === String(task.id));
    const metrics = measureRows();
    const sourceMetric = metrics.get(String(task.id));
    if (sourceIndex < 0 || !sourceMetric) return;
    if (mode === "pointer") {
      event.preventDefault();
      try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch {}
    }
    const next = {
      mode,
      sourceId: task.id,
      sourceIndex,
      dropIndex: sourceIndex,
      pointerId: mode === "pointer" ? event.pointerId : null,
      pointerTarget: mode === "pointer" ? event.currentTarget : null,
      pointerX: mode === "pointer" ? event.clientX : sourceMetric.left + 20,
      pointerY: mode === "pointer" ? event.clientY : sourceMetric.top + sourceMetric.height / 2,
      offsetX: mode === "pointer" ? event.clientX - sourceMetric.left : 20,
      offsetY: mode === "pointer" ? event.clientY - sourceMetric.top : sourceMetric.height / 2,
      rowRect: sourceMetric,
    };
    dragRef.current = next;
    setDragState(next);
    setLiveMessage(t("dragPicked", { name: task.name || t("unnamedTask") }));
  }, [measureRows, ordering, t, tasks]);

  const finishDrag = React.useCallback((cancelled = false) => {
    const current = dragRef.current;
    if (!current) return;
    try { current.pointerTarget?.releasePointerCapture?.(current.pointerId); } catch {}
    dragRef.current = null;
    setDragState(null);
    if (cancelled) {
      setLiveMessage(t("dragCancelled"));
      return;
    }
    const sourceIndex = current.sourceIndex;
    const targetIndex = current.dropIndex;
    if (targetIndex === sourceIndex) {
      setLiveMessage(t("dragDropped"));
      return;
    }
    const nextTasks = [...tasks];
    const [moved] = nextTasks.splice(sourceIndex, 1);
    nextTasks.splice(targetIndex, 0, moved);
    setLiveMessage(t("dragDropped"));
    onReorder(nextTasks);
  }, [onReorder, t, tasks]);

  const updatePointerDrag = React.useCallback((event) => {
    const current = dragRef.current;
    if (!current || current.mode !== "pointer" || event.pointerId !== current.pointerId) return;
    event.preventDefault();
    const dropIndex = dropIndexForPointer(event.clientY, current.sourceIndex);
    const next = { ...current, dropIndex, pointerX: event.clientX, pointerY: event.clientY };
    dragRef.current = next;
    setDragState(next);
  }, [dropIndexForPointer]);

  React.useEffect(() => {
    if (dragMode !== "pointer") return undefined;
    const move = (event) => updatePointerDrag(event);
    const up = (event) => {
      if (dragRef.current?.pointerId === event.pointerId) finishDrag(false);
    };
    const cancel = () => finishDrag(true);
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("blur", cancel);
    };
  }, [dragMode, finishDrag, updatePointerDrag]);

  React.useEffect(() => {
    if (!dragMode) return undefined;
    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = dragMode === "pointer" ? "grabbing" : "default";
    return () => {
      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
    };
  }, [dragMode]);

  const moveKeyboardDrag = (delta) => {
    const current = dragRef.current;
    if (!current || current.mode !== "keyboard") return;
    const nextIndex = Math.max(0, Math.min(tasks.length - 1, current.dropIndex + delta));
    if (nextIndex === current.dropIndex) return;
    const next = { ...current, dropIndex: nextIndex };
    dragRef.current = next;
    setDragState(next);
    setLiveMessage(t("dragMoved", { position: nextIndex + 1 }));
  };

  const handleHandleKeyDown = (event, task) => {
    const active = dragRef.current;
    if (event.key === " " || event.key === "Space" || event.code === "Space" || event.key === "Enter") {
      event.preventDefault();
      if (!active) startDrag("keyboard", event, task);
      else if (active.mode === "keyboard" && String(active.sourceId) === String(task.id)) finishDrag(false);
      return;
    }
    if (event.key === "Escape" && active?.mode === "keyboard") {
      event.preventDefault();
      finishDrag(true);
      return;
    }
    if (active?.mode === "keyboard" && String(active.sourceId) === String(task.id)) {
      if (event.key === "ArrowUp") { event.preventDefault(); moveKeyboardDrag(-1); }
      if (event.key === "ArrowDown") { event.preventDefault(); moveKeyboardDrag(1); }
      if (event.key === "Home") { event.preventDefault(); moveKeyboardDrag(-tasks.length); }
      if (event.key === "End") { event.preventDefault(); moveKeyboardDrag(tasks.length); }
    }
  };

  const rowShift = (index) => {
    if (!dragState || index === dragState.sourceIndex) return 0;
    const sourceMetric = metricsRef.current.get(String(dragState.sourceId));
    const sourceHeight = sourceMetric?.height || 0;
    if (dragState.dropIndex > dragState.sourceIndex && index > dragState.sourceIndex && index <= dragState.dropIndex) return -sourceHeight;
    if (dragState.dropIndex < dragState.sourceIndex && index >= dragState.dropIndex && index < dragState.sourceIndex) return sourceHeight;
    return 0;
  };

  const markerForRow = (index) => {
    if (!dragState || dragState.dropIndex === dragState.sourceIndex) return "";
    if (dragState.dropIndex < dragState.sourceIndex && index === dragState.dropIndex) return "before";
    if (dragState.dropIndex > dragState.sourceIndex && index === dragState.dropIndex) return "after";
    return "";
  };

  const activeTask = dragState && tasks.find((task) => String(task.id) === String(dragState.sourceId));
  const overlayWidth = dragState?.rowRect ? Math.min(dragState.rowRect.width, Math.max(0, window.innerWidth - 24)) : 0;
  const overlayLeft = dragState?.rowRect ? Math.max(12, Math.min(dragState.mode === "pointer" ? dragState.pointerX - dragState.offsetX : dragState.rowRect.left, window.innerWidth - overlayWidth - 12)) : 0;
  const overlayTop = dragState?.mode === "pointer" ? Math.max(8, dragState.pointerY - dragState.offsetY) : 0;

  return (
    <>
      <div className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="check-cell"><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label={t("selectAll")} /></th>
                <th className="drag-cell" aria-label={t("reorderTask")} />
                <th>{t("name")}</th>
                <th>{t("appServers")}</th>
                <th>{t("target")}</th>
                <th>{t("type")}</th>
                <th>{t("interval")}</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => {
                const active = dragState && String(dragState.sourceId) === String(task.id);
                const marker = markerForRow(index);
                const rowClass = [active ? "drag-source" : "", marker ? `drag-marker-${marker}` : ""].filter(Boolean).join(" ");
                return (
                  <tr
                    key={task.id}
                    ref={(node) => { const key = String(task.id); if (node) rowRefs.current.set(key, node); else rowRefs.current.delete(key); }}
                    className={rowClass}
                    style={dragState ? { transform: `translate3d(0, ${rowShift(index)}px, 0)` } : undefined}
                  >
                    <td className="check-cell"><input type="checkbox" checked={selected.includes(task.id)} onChange={() => toggleTask(task.id)} aria-label={`${t("select")} ${task.name || t("unnamedTask")}`} /></td>
                    <td className="drag-cell"><button type="button" className="drag-handle" disabled={ordering} title={t("reorderTask")} aria-label={t("reorderTask")} aria-roledescription="sortable" aria-describedby="task-drag-instructions" aria-pressed={active ? "true" : undefined} onPointerDown={(event) => { if (event.pointerType === "mouse" && event.button !== 0) return; startDrag("pointer", event, task); }} onPointerMove={updatePointerDrag} onPointerUp={(event) => { if (dragRef.current?.pointerId === event.pointerId) finishDrag(false); }} onPointerCancel={() => finishDrag(true)} onKeyDown={(event) => handleHandleKeyDown(event, task)}><span className="drag-handle-icon" aria-hidden="true"><span /><span /><span /></span></button></td>
                    <td><strong>{task.name || t("unnamedTask")}</strong><span className="subtext">#{task.id}</span></td>
                    <TaskServerCell task={task} clients={clients} onUpdated={onTaskUpdated} onError={onError} />
                    <td className="mono">{task.target}</td>
                    <td><span className="type-badge">{String(task.type || "icmp").toUpperCase()}</span></td>
                    <td>{task.interval}s</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <span id="task-drag-instructions" className="sr-only">{t("dragInstructions")}</span>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">{liveMessage}</div>
      {dragState?.mode === "pointer" && activeTask && <TaskDragOverlay task={activeTask} clients={clients} style={{ left: overlayLeft, top: overlayTop, width: overlayWidth }} />}
    </>
  );
}

function App() {
  const t = useT();
  const [tasks, setTasks] = React.useState([]);
  const [clients, setClients] = React.useState([]);
  const [selected, setSelected] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [ordering, setOrdering] = React.useState(false);
  const [error, setError] = React.useState("");
  const [modal, setModal] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const [toast, setToast] = React.useState("");

  const load = React.useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const [taskData, clientData] = await Promise.all([request("/api/admin/ping/"), request("/api/admin/client/list")]);
      const nextTasks = Array.isArray(taskData) ? taskData : [];
      const nextClients = Array.isArray(clientData) ? clientData : [];
      setTasks(nextTasks);
      setClients(nextClients);
      setSelected((current) => current.filter((id) => nextTasks.some((task) => task.id === id)));
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

  const reorderTasks = React.useCallback(async (nextTasks) => {
    const order = Object.fromEntries(nextTasks.map((task, index) => [String(task.id), index]));
    setTasks(nextTasks);
    setError("");
    setOrdering(true);
    try {
      await request("/api/admin/ping/order", { method: "POST", body: JSON.stringify(order) });
      setToast(t("orderSaved"));
      await load(true);
    } catch (caught) {
      setError(caught.message);
      await load(true);
    } finally {
      setOrdering(false);
    }
  }, [load, t]);

  const toggleAll = () => setSelected(selected.length === tasks.length ? [] : tasks.map((task) => task.id));
  const deleteSelected = async () => {
    setDeleting(true);
    try { await request("/api/admin/ping/delete", { method: "POST", body: JSON.stringify({ id: selected }) }); setSelected([]); setModal(""); setToast(t("deleteDone")); await load(true); } catch (caught) { setError(caught.message); } finally { setDeleting(false); }
  };
  const afterSaved = async (message) => { setModal(""); setSelected([]); setToast(message); await load(true); };
  const updateTaskClients = (id, nextClients) => setTasks((current) => current.map((task) => task.id === id ? { ...task, clients: nextClients } : task));

  return <main className="app-shell"><header className="page-header"><div><div className="eyebrow">{t("pluginEyebrow")}</div><h1>{t("pageTitle")}</h1><p>{t("pageSubtitle")}</p></div><div className="header-actions"><button type="button" className="button secondary" onClick={() => load(true)} disabled={refreshing || ordering}>{refreshing ? t("refreshing") : t("refresh")}</button><button type="button" className="button primary" onClick={() => setModal("import")} disabled={ordering}>{t("importTasks")}</button></div></header><section className="toolbar"><div><strong>{tasks.length}</strong><span className="muted"> {t("taskUnit")}</span>{selected.length > 0 && <span className="selection-count">{t("selectedCount", { count: selected.length })}</span>}</div><div className="toolbar-actions">{selected.length > 0 && <><button type="button" className="button secondary" onClick={() => setModal("edit")} disabled={ordering}>{t("editTasks")}</button><button type="button" className="button danger" onClick={() => setModal("delete")} disabled={ordering}>{t("deleteTasks")}</button></>}</div></section>{error && <div className="notice error">{error}<button type="button" onClick={() => load()}>{t("retry")}</button></div>}{loading ? <div className="empty-state"><span className="spinner" />{t("loadingTasks")}</div> : tasks.length === 0 ? <div className="empty-state"><strong>{t("noTasks")}</strong><span>{t("noTasksHint")}</span></div> : <TaskTable tasks={tasks} clients={clients} selected={selected} onSelectionChange={setSelected} onTaskUpdated={updateTaskClients} onError={setError} onReorder={reorderTasks} ordering={ordering} />}<StorageEstimate tasks={tasks} />{toast && <div className="toast">{toast}</div>}{modal === "import" && <ImportModal clients={clients} onClose={() => setModal("")} onImported={({ success, failures }) => { setToast(failures ? t("importComplete", { success, failed: failures }) : t("importCompleteShort", { success })); load(true); }} />}{modal === "edit" && <EditModal tasks={tasks.filter((task) => selected.includes(task.id))} clients={clients} onClose={() => setModal("")} onSaved={() => afterSaved(t("editDone"))} />}{modal === "delete" && <DeleteModal count={selected.length} deleting={deleting} onClose={() => setModal("")} onConfirm={deleteSelected} />}</main>;
}

createRoot(document.getElementById("root")).render(<LocaleProvider><App /></LocaleProvider>);
