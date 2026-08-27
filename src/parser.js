const fieldKeys = {
  name: ["name", "Name", "名称", "名稱", "名前", "nama"],
  target: ["target", "Target", "目标", "目標", "対象"],
  type: ["type", "Type", "类型", "類型", "種別", "jenis"],
  interval: ["interval", "Interval", "间隔", "間隔"],
};

const allowedJsonKeys = new Set(Object.values(fieldKeys).flat());
const delimiters = [",", "-", "|"];
const types = new Set(["icmp", "tcp", "http"]);

const valueFor = (value, keys) =>
  keys.map((key) => value?.[key]).find((item) => item !== undefined);

const hasText = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";

const failed = (row, message, near = "") => ({
  row,
  name: "",
  target: "",
  type: "icmp",
  interval: 60,
  status: "failed",
  message,
  near,
});

const normalize = (value, row, near = "") => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return failed(row, "每条 JSON 项必须是对象", near);
  }
  const extra = Object.keys(value).filter((key) => !allowedJsonKeys.has(key));
  if (extra.length) return failed(row, `包含不支持的字段: ${extra.join(", ")}`, near);

  const name = valueFor(value, fieldKeys.name);
  const target = valueFor(value, fieldKeys.target);
  const typeValue = valueFor(value, fieldKeys.type);
  const intervalValue = valueFor(value, fieldKeys.interval);
  const type = String(typeValue ?? "").trim().toLowerCase();
  const interval = Number(intervalValue);
  if (!hasText(name) || !hasText(target) || !hasText(typeValue) || !hasText(intervalValue)) {
    return failed(row, "需要 name、target、type、interval 四个字段", near);
  }
  if (!types.has(type)) return failed(row, `type 必须是 icmp、tcp 或 http: ${type}`, near);
  if (!Number.isInteger(interval) || interval <= 0) {
    return failed(row, `interval 必须是大于 0 的整数: ${intervalValue}`, near);
  }
  return {
    row,
    name: String(name).trim(),
    target: String(target).trim(),
    type,
    interval,
    status: "pending",
  };
};

const lineContext = (line, offset) => `${line}\n${" ".repeat(Math.max(0, offset))}^`;

const parseLine = (line, row) => {
  const candidates = delimiters
    .map((delimiter) => ({ delimiter, parts: line.split(delimiter).map((part) => part.trim()) }))
    .filter(({ parts }) => parts.length > 1);
  if (!candidates.length) return failed(row, "每行需要使用逗号、短横线或竖线分隔", line);
  const candidate =
    candidates.find(({ parts }) => parts.length >= 4) ??
    candidates.sort((a, b) => b.parts.length - a.parts.length)[0];
  const { delimiter, parts } = candidate;
  const empty = parts.findIndex((part) => part === "");
  if (empty >= 0) {
    const offset = parts.slice(0, empty).reduce((sum, part) => sum + part.length + delimiter.length, 0);
    return failed(row, "字段不能为空", lineContext(line, offset));
  }
  if (parts.length < 4) return failed(row, "每行需要四个字段: name, target, type, interval", lineContext(line, line.length));
  if (parts.length > 4 && delimiter !== "-") {
    return failed(row, `包含多余字段: ${parts.slice(4).join(delimiter)}`, lineContext(line, parts.slice(0, 4).join(delimiter).length));
  }
  const interval = parts.pop();
  const type = parts.pop();
  const name = parts.shift();
  return normalize({ name, target: parts.join(delimiter), type, interval }, row, line);
};

const jsonError = (text, error) => {
  const match = String(error?.message || "").match(/position (\d+)/i);
  const offset = Math.min(Number(match?.[1] ?? 0), text.length);
  const before = text.slice(0, offset);
  const line = before.split("\n").length;
  const lineStart = before.lastIndexOf("\n") + 1;
  const sourceLine = text.slice(lineStart, text.indexOf("\n", offset) < 0 ? text.length : text.indexOf("\n", offset)).replace(/\r$/, "");
  return failed(line, `JSON 语法错误: ${error.message}`, lineContext(sourceLine, offset - lineStart));
};

export function parseImportText(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      return (Array.isArray(parsed) ? parsed : [parsed]).map((value, index) => normalize(value, index + 1));
    } catch (error) {
      return [jsonError(trimmed, error)];
    }
  }
  return trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => parseLine(line, index + 1));
}
