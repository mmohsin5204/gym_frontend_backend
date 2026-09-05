// Simple JSON -> CSV converter, external dependency ki zaroorat nahi
const jsonToCsv = (rows, columns) => {
  if (!rows || rows.length === 0) {
    return columns.map((c) => c.label).join(",") + "\n";
  }

  const escapeCell = (value) => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map((c) => escapeCell(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCell(c.value(row))).join(","))
    .join("\n");

  return `${header}\n${body}\n`;
};

module.exports = { jsonToCsv };
