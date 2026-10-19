function parseCsvLine(line) {
  const values = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && quoted && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(value.trim());
      value = '';
    } else {
      value += char;
    }
  }
  values.push(value.trim());
  return values;
}

function rowsToObjects(rows) {
  const [headers = [], ...values] = rows;
  const normalized = headers.map((header, index) => String(header || `Column ${index + 1}`).trim());
  return {
    headers: normalized,
    rows: values
      .filter((row) => row.some((value) => String(value ?? '').trim()))
      .map((row, rowIndex) => ({
        _row: rowIndex + 2,
        ...Object.fromEntries(normalized.map((header, index) => [header, row[index] ?? ''])),
      })),
  };
}

export async function parseImportFile(file) {
  if (!file) throw new Error('Select a file to continue.');
  if (file.size > 10 * 1024 * 1024) throw new Error('The import file must be 10 MB or smaller.');
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'csv') {
    const text = await file.text();
    return rowsToObjects(
      text
        .replace(/^\uFEFF/, '')
        .split(/\r?\n/)
        .filter(Boolean)
        .map(parseCsvLine)
    );
  }
  if (extension === 'xlsx') {
    const module = await import('exceljs');
    const ExcelJS = module.default || module;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new Error('The workbook does not contain a worksheet.');
    const rows = [];
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      rows.push(row.values.slice(1).map((value) => value?.text ?? value ?? ''));
    });
    return rowsToObjects(rows);
  }
  throw new Error('Select a CSV or XLSX file.');
}
