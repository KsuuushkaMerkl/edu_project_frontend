export function toCSV(rows) {
    if (!rows || rows.length === 0) return ''
    const cols = Object.keys(rows[0])
    const header = cols.join(';')
    const body = rows.map(r => cols.map(c => escapeCell(r[c])).join(';')).join('\n')
    return header + '\n' + body
}

function escapeCell(val) {
    if (val == null) return ''
    const s = String(val).replace(/"/g, '""')
    if (s.includes(';') || s.includes('"') || s.includes('\n')) {
        return `"${s}"`
    }
    return s
}

export function downloadCSV(filename, rows) {
    const csv = '\uFEFF' + toCSV(rows)
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}