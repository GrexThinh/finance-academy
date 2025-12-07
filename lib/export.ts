import * as XLSX from 'xlsx'

export interface ExportData {
  headers: string[]
  rows: any[][]
  sheetName: string
}

export function exportToExcel(data: ExportData[], fileName: string): void {
  const workbook = XLSX.utils.book_new()

  data.forEach(({ headers, rows, sheetName }) => {
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  })

  XLSX.writeFile(workbook, fileName)
}

export function createExcelBuffer(data: ExportData[]): Buffer {
  const workbook = XLSX.utils.book_new()

  data.forEach(({ headers, rows, sheetName }) => {
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  })

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  return buffer
}

export function createCSVBuffer(data: ExportData): Buffer {
  const csvContent = [
    data.headers.join(','),
    ...data.rows.map(row => row.map(cell => {
      // Escape commas and quotes in CSV
      const cellStr = String(cell)
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`
      }
      return cellStr
    }).join(','))
  ].join('\n')

  return Buffer.from(csvContent, 'utf-8')
}