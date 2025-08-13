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

// Certificate Generation
export const downloadInternCertificatePDF = (logs: TimeLog[], userInfo: { firstName: string; lastName: string; employeeId: string }) => {
  const { jsPDF } = jspdf;
  const doc = new jsPDF('landscape', 'mm', 'a4'); // Landscape orientation for certificate
  
  // Certificate dimensions (A4 landscape: 297mm x 210mm)
  const pageWidth = 297;
  const pageHeight = 210;
  
  // Background and border
  doc.setFillColor(255, 255, 255); // White background
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Elegant border
  doc.setDrawColor(184, 134, 11); // Gold color
  doc.setLineWidth(3);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);
  
  // Inner decorative border
  doc.setLineWidth(1);
  doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
  
  // Header text
  doc.setTextColor(184, 134, 11); // Gold color
  doc.setFontSize(24);
  doc.setFont('times', 'bold');
  doc.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 50, { align: 'center' });
  
  // Subheader
  doc.setFontSize(16);
  doc.setFont('times', 'normal');
  doc.text('BULLDOG GARAGE INTERNSHIP PROGRAM', pageWidth / 2, 65, { align: 'center' });
  
  // Decorative line
  doc.setDrawColor(184, 134, 11);
  doc.setLineWidth(2);
  doc.line(80, 75, pageWidth - 80, 75);
  
  // Certificate body text
  doc.setTextColor(0, 0, 0); // Black text
  doc.setFontSize(14);
  doc.setFont('times', 'normal');
  doc.text('This is to certify that', pageWidth / 2, 95, { align: 'center' });
  
  // Student name in fancy style (larger, bold, italic)
  const studentName = `${userInfo.firstName} ${userInfo.lastName}`;
  const studentIdText = `#${userInfo.employeeId}`;
  
  doc.setFontSize(32);
  doc.setFont('times', 'bolditalic');
  doc.setTextColor(25, 25, 112); // Dark blue for name
  
  // Calculate text width for proper centering of name and ID
  const nameWidth = doc.getTextWidth(studentName);
  const idWidth = doc.getTextWidth(studentIdText);
  const totalWidth = nameWidth + idWidth + 10; // 10mm space between name and ID
  const startX = (pageWidth - totalWidth) / 2;
  
  // Draw student name
  doc.text(studentName, startX, 115);
  
  // Draw student ID right after the name
  doc.setFontSize(20);
  doc.setFont('times', 'normal');
  doc.setTextColor(100, 100, 100); // Gray for ID
  doc.text(studentIdText, startX + nameWidth + 5, 115);
  
  // Completion text
  doc.setFontSize(14);
  doc.setFont('times', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('has successfully completed the required time tracking', pageWidth / 2, 135, { align: 'center' });
  doc.text('and demonstrated commitment to professional development', pageWidth / 2, 150, { align: 'center' });
  doc.text('during their internship period.', pageWidth / 2, 165, { align: 'center' });
  
  // Date (positioned for seal placement above it)
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Date: ${currentDate}`, 50, 185);
  
  // Draw realistic gold seal about 1 inch (25mm) above the date
  drawGoldSeal(doc, pageWidth - 70, 185 - 25); // Position seal above date
  
  // Signature line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(200, 185, 260, 185);
  doc.setFontSize(10);
  doc.text('Director, Bulldog Garage', 230, 190, { align: 'center' });
  
  // Calculate total hours worked
  const totalHours = calculateTotalHours(logs);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Total Hours Completed: ${totalHours}`, pageWidth / 2, 200, { align: 'center' });
  
  // Save the certificate
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const fileName = `${userInfo.firstName}_${userInfo.lastName}_Certificate_${dateStr}.pdf`;
  doc.save(fileName);
};

// Helper function to draw a realistic gold seal
const drawGoldSeal = (doc: any, x: number, y: number) => {
  const radius = 20;
  
  // Outer circle - gold background
  doc.setFillColor(255, 215, 0); // Gold color
  doc.setDrawColor(184, 134, 11); // Darker gold border
  doc.setLineWidth(2);
  doc.circle(x, y, radius, 'FD');
  
  // Inner decorative circle
  doc.setFillColor(255, 235, 59); // Lighter gold
  doc.setDrawColor(255, 193, 7); // Medium gold
  doc.setLineWidth(1);
  doc.circle(x, y, radius - 3, 'FD');
  
  // Central text "BULLDOG" and "GARAGE"
  doc.setTextColor(139, 69, 19); // Brown color for text
  doc.setFontSize(8);
  doc.setFont('times', 'bold');
  doc.text('BULLDOG', x, y - 4, { align: 'center' });
  doc.text('GARAGE', x, y + 4, { align: 'center' });
  
  // Decorative stars around the text
  doc.setFontSize(6);
  doc.text('★', x - 12, y - 8, { align: 'center' });
  doc.text('★', x + 12, y - 8, { align: 'center' });
  doc.text('★', x - 12, y + 8, { align: 'center' });
  doc.text('★', x + 12, y + 8, { align: 'center' });
  
  // Outer decorative border with small notches
  doc.setDrawColor(184, 134, 11);
  doc.setLineWidth(1);
  for (let angle = 0; angle < 360; angle += 30) {
    const radians = (angle * Math.PI) / 180;
    const x1 = x + (radius - 1) * Math.cos(radians);
    const y1 = y + (radius - 1) * Math.sin(radians);
    const x2 = x + (radius + 2) * Math.cos(radians);
    const y2 = y + (radius + 2) * Math.sin(radians);
    doc.line(x1, y1, x2, y2);
  }
};

// Helper function to calculate total hours from time logs
const calculateTotalHours = (logs: TimeLog[]): string => {
  let totalMinutes = 0;
  let lastCheckIn: TimeLog | null = null;
  
  // Sort logs by timestamp
  const sortedLogs = [...logs].sort((a, b) => a.rawTimestamp - b.rawTimestamp);
  
  for (const log of sortedLogs) {
    if (log.action === 'IN') {
      lastCheckIn = log;
    } else if (log.action === 'OUT' && lastCheckIn) {
      const duration = log.rawTimestamp - lastCheckIn.rawTimestamp;
      totalMinutes += Math.floor(duration / 60000); // Convert milliseconds to minutes
      lastCheckIn = null;
    }
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours} hours, ${minutes} minutes`;
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
