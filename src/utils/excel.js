import ExcelJS from 'exceljs'

export async function downloadXLSX(filename, rows) {
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Данные')

    if (!rows || rows.length === 0) {
        ws.addRow(['Нет данных'])
    } else {
        const headers = Object.keys(rows[0])
        ws.addRow(headers)
        const headerRow = ws.getRow(1)
        headerRow.font = {bold: true}
        headerRow.eachCell((cell) => {
            cell.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFF3E8EA'}}
            cell.border = {top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'}}
        })
        for (const r of rows) ws.addRow(headers.map(h => r[h]))
        ws.columns = headers.map(h => ({key: h, width: Math.max(12, String(h).length + 2)}))
    }

    const buf = await wb.xlsx.writeBuffer()
    const blob = new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename || 'export.xlsx'
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(a.href)
    a.remove()
}
