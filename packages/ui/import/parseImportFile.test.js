import { describe, expect, it } from 'vitest';
import { parseImportFile } from './parseImportFile';

describe('parseImportFile', () => {
  it('parses quoted CSV values and preserves source row numbers', async () => {
    const file = new File(
      ['Name,Admission Number,Guardian\n"Amina, Noor",A-1,Fatima'],
      'students.csv',
      { type: 'text/csv' }
    );

    const result = await parseImportFile(file);

    expect(result.headers).toEqual(['Name', 'Admission Number', 'Guardian']);
    expect(result.rows).toEqual([
      {
        _row: 2,
        Name: 'Amina, Noor',
        'Admission Number': 'A-1',
        Guardian: 'Fatima',
      },
    ]);
  });

  it('rejects unsupported files', async () => {
    const file = new File(['students'], 'students.txt', { type: 'text/plain' });
    await expect(parseImportFile(file)).rejects.toThrow('Select a CSV or XLSX file.');
  });
});
