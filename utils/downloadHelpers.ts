import { TimeLog, AbsenceLog } from '../types';

declare const jspdf: any;

const downloadBlob = (content: string, filename: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// CSV Utilities
const convertToCSV = (headers: string[], data: (string | number | undefined)[][]) => {
    const headerRow = headers.join(',');
    const bodyRows = data.map(row => 
        row.map(cell => {
            const str = String(cell ?? '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        }).join(',')
    ).join('\n');
    return `${headerRow}\n${bodyRows}`;
};

export const downloadTimeLogsCSV = (logs: TimeLog[], prefix: string) => {
  const headers = ['Action', 'First Name', 'Last Name', 'Student ID', 'Timestamp', 'Duration', 'Latitude', 'Longitude', 'Accuracy', 'Device Name', 'Device ID', 'User Agent'];
  const data = logs.map(l => [
      l.action,
      l.firstName,
      l.lastName,
      l.employeeId,
      l.timestamp,
      l.duration || '',
      l.latitude,
      l.longitude,
      l.accuracy,
      l.deviceName,
      l.deviceId,
      l.userAgent
  ]);
  const csvData = convertToCSV(headers, data);
  downloadBlob(csvData, `${prefix}_time_logs.csv`, 'text/csv;charset=utf-8;');
};

export const downloadAbsencesCSV = (absences: AbsenceLog[], prefix: string) => {
  const headers = ['First Name', 'Last Name', 'Student ID', 'Absence Date', 'Reason', 'Submitted On'];
  const data = absences.map(a => [a.firstName, a.lastName, a.employeeId, a.date, a.reason, a.submitted]);
  const csvData = convertToCSV(headers, data);
  downloadBlob(csvData, `${prefix}_absence_logs.csv`, 'text/csv;charset=utf-8;');
};

// PDF Utilities
export const downloadTimeLogsPDF = (logs: TimeLog[], title: string, prefix: string) => {
  const { jsPDF } = jspdf;
  const doc = new jsPDF();
  doc.text(title, 14, 16);
  (doc as any).autoTable({
    startY: 20,
    head: [['Action', 'Name', 'Student ID', 'Timestamp', 'Duration', 'Location (Lat, Lng)', 'Device']],
    body: logs.map(l => [
        l.action, 
        `${l.firstName} ${l.lastName}`, 
        l.employeeId, 
        l.timestamp, 
        l.duration || '', 
        l.latitude && l.longitude ? `${l.latitude.toFixed(4)}, ${l.longitude.toFixed(4)}` : 'N/A', 
        l.deviceName
    ]),
  });
  doc.save(`${prefix}_time_logs.pdf`);
};

export const downloadAbsencesPDF = (absences: AbsenceLog[], title: string, prefix: string) => {
  const { jsPDF } = jspdf;
  const doc = new jsPDF();
  doc.text(title, 14, 16);
  (doc as any).autoTable({
    startY: 20,
    head: [['Name', 'Student ID', 'Absence Date', 'Reason', 'Submitted On']],
    body: absences.map(a => [`${a.firstName} ${a.lastName}`, a.employeeId, a.date, a.reason, a.submitted]),
  });
  doc.save(`${prefix}_absence_logs.pdf`);
};


// HTML Utilities
const generateHtml = (title: string, tableHtml: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: sans-serif; margin: 2em; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        h1 { color: #333; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${tableHtml}
    </body>
  </html>`;

const generateTableHtml = (headers: string[], data: any[], rowGenerator: (item: any) => string) => {
  let table = '<table><thead><tr>';
  headers.forEach(h => table += `<th>${h}</th>`);
  table += '</tr></thead><tbody>';
  data.forEach(item => table += rowGenerator(item));
  table += '</tbody></table>';
  return table;
};

export const downloadTimeLogsHTML = (logs: TimeLog[], prefix: string) => {
  const headers = ['Action', 'Name', 'Student ID', 'Timestamp', 'Duration', 'Location', 'Device', 'Device ID', 'User Agent'];
  const table = generateTableHtml(headers, logs, (l: TimeLog) => `
    <tr>
      <td>${l.action}</td>
      <td>${l.firstName} ${l.lastName}</td>
      <td>${l.employeeId}</td>
      <td>${l.timestamp}</td>
      <td>${l.duration || ''}</td>
      <td>${l.latitude && l.longitude ? `${l.latitude.toFixed(5)}, ${l.longitude.toFixed(5)} (Acc: ${l.accuracy}m)` : 'N/A'}</td>
      <td>${l.deviceName}</td>
      <td>${l.deviceId}</td>
      <td>${l.userAgent}</td>
    </tr>`);
  downloadBlob(generateHtml('All Time Logs', table), `${prefix}_time_logs.html`, 'text/html;charset=utf-8;');
};

export const downloadAbsencesHTML = (absences: AbsenceLog[], prefix: string) => {
  const headers = ['Name', 'Student ID', 'Date', 'Reason', 'Submitted'];
  const table = generateTableHtml(headers, absences, (a: AbsenceLog) => `
    <tr>
      <td>${a.firstName} ${a.lastName}</td>
      <td>${a.employeeId}</td>
      <td>${a.date}</td>
      <td>${a.reason}</td>
      <td>${a.submitted}</td>
    </tr>`);
  downloadBlob(generateHtml('All Absence Logs', table), `${prefix}_absence_logs.html`, 'text/html;charset=utf-8;');
};
