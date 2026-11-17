import { load } from "cheerio";

export type EmployeeRecord = {
  serial: string;
  status: "valid";
  fields: Array<{ label: string; value: string }>;
  sourceFile: string;
};

// The URL segment after /verify/ is the exact employee filename in this repo.
const owner = process.env.GITHUB_OWNER || "SEXY0090";
const repo = process.env.GITHUB_REPO || "NRAN";
const branch = process.env.GITHUB_BRANCH || "main";
const dataDir = (process.env.GITHUB_DATA_DIR || "").replace(/^\/+|\/+$/g, "");

function safePath(path: string) {
  const parts = path.split("/");
  if (!path || parts.some(p => !p || p === "." || p === "..")) {
    throw new Error("Invalid employee data path");
  }
  return parts.map(encodeURIComponent).join("/");
}

async function fetchGithubFile(path: string): Promise<string> {
  const fullPath = [dataDir, path].filter(Boolean).join("/");
  const url = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${safePath(fullPath)}`;
  const headers: HeadersInit = { Accept: "text/plain" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(url, { headers, next: { revalidate: 60 } });
  if (!response.ok) throw new Error(response.status === 404 ? "Employee record not found" : `GitHub returned ${response.status}`);
  return response.text();
}

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function extractFields(source: string): Array<{label:string;value:string}> {
  const trimmed = source.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const obj = JSON.parse(trimmed);
      const flat: Array<{label:string;value:string}> = [];
      const visit = (value: unknown, prefix = "") => {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          Object.entries(value as Record<string, unknown>).forEach(([k,v]) => visit(v, prefix ? `${prefix} ${k}` : k));
        } else if (Array.isArray(value)) {
          value.forEach((v,i) => visit(v, `${prefix} ${i+1}`));
        } else if (value !== null && value !== undefined && String(value).trim()) {
          flat.push({label: prefix.replace(/[_-]/g," ").replace(/\b\w/g,c=>c.toUpperCase()), value:String(value)});
        }
      };
      visit(obj);
      return flat;
    } catch {}
  }

  const $ = load(source);
  const rows: Array<{label:string;value:string}> = [];
  const add = (label: string, value: string) => {
    label = clean(label).replace(/\s*:\s*$/, ""); value = clean(value);
    if (label && value && !rows.some(r => r.label.toLowerCase() === label.toLowerCase())) rows.push({label,value});
  };

  $(".mrz-row").each((_, el) => {
    const children = $(el).children();
    add(children.eq(0).text(), children.eq(1).text());
  });
  $("tr").each((_, el) => {
    const cells = $(el).find("th,td");
    if (cells.length >= 2) add(cells.eq(0).text(), cells.eq(1).text());
  });
  $("dt").each((_, el) => add($(el).text(), $(el).next("dd").text()));
  $("[data-label]").each((_, el) => add($(el).attr("data-label") || "", $(el).text()));

  if (!rows.length) {
    $("p, li, div").each((_, el) => {
      const text = clean($(el).text());
      const match = text.match(/^([^:：]{2,60})[:：]\s*(.{1,250})$/);
      if (match) add(match[1], match[2]);
    });
  }
  return rows;
}

export async function getEmployee(employeeFile: string): Promise<EmployeeRecord | null> {
  // Never accept nested paths or arbitrary URL characters from the route.
  if (!/^[A-Za-z0-9._-]{1,120}$/.test(employeeFile) || employeeFile === "." || employeeFile === "..") return null;
  try {
    const source = await fetchGithubFile(employeeFile);
    const fields = extractFields(source);
    if (!fields.length) throw new Error("No employee fields found in source file");
    return { serial: employeeFile, status: "valid", fields, sourceFile: employeeFile };
  } catch (error) {
    if (error instanceof Error && error.message === "Employee record not found") return null;
    throw error;
  }
}
