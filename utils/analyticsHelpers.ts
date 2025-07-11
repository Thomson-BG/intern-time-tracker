// utils/analyticsHelpers.ts

import { TimeLog } from './timeTrackerApi';

export interface WorkSummary {
  employeeId: string;
  name: string;
  totalHours: number;
  totalDays: number;
  checkIns: number;
  checkOuts: number;
  averageHoursPerDay: number;
  firstActivity: string;
  lastActivity: string;
}

export interface DailyActivity {
  date: string;
  checkIns: number;
  checkOuts: number;
  totalHours: number;
  employees: Set<string>;
}

export function calculateWorkSummary(timeLogs: TimeLog[]): WorkSummary[] {
  const employeeMap = new Map<string, {
    name: string;
    checkIns: TimeLog[];
    checkOuts: TimeLog[];
    totalHours: number;
    dates: Set<string>;
  }>();

  // Group logs by employee
  timeLogs.forEach(log => {
    if (!log.employeeId || !log.action) return;
    
    const key = log.employeeId;
    if (!employeeMap.has(key)) {
      employeeMap.set(key, {
        name: `${log.firstName} ${log.lastName}`,
        checkIns: [],
        checkOuts: [],
        totalHours: 0,
        dates: new Set()
      });
    }
    
    const employee = employeeMap.get(key)!;
    if (log.action === 'IN') {
      employee.checkIns.push(log);
    } else if (log.action === 'OUT') {
      employee.checkOuts.push(log);
    }
    
    if (log.timestamp) {
      employee.dates.add(log.timestamp.split('T')[0]);
    }
  });

  // Calculate summary for each employee
  const summaries: WorkSummary[] = [];
  employeeMap.forEach((data, employeeId) => {
    // Calculate total hours (simplified)
    const totalHours = Math.min(data.checkIns.length, data.checkOuts.length) * 8; // Assume 8 hours per full day
    
    const allLogs = [...data.checkIns, ...data.checkOuts].sort((a, b) => 
      new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
    );
    
    summaries.push({
      employeeId,
      name: data.name,
      totalHours,
      totalDays: data.dates.size,
      checkIns: data.checkIns.length,
      checkOuts: data.checkOuts.length,
      averageHoursPerDay: data.dates.size > 0 ? totalHours / data.dates.size : 0,
      firstActivity: allLogs[0]?.timestamp || 'N/A',
      lastActivity: allLogs[allLogs.length - 1]?.timestamp || 'N/A'
    });
  });

  return summaries.sort((a, b) => b.totalHours - a.totalHours);
}

export function calculateDailyActivity(timeLogs: TimeLog[]): DailyActivity[] {
  const dailyMap = new Map<string, {
    checkIns: number;
    checkOuts: number;
    employees: Set<string>;
  }>();

  timeLogs.forEach(log => {
    if (!log.timestamp || !log.action) return;
    
    const date = log.timestamp.split('T')[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        checkIns: 0,
        checkOuts: 0,
        employees: new Set()
      });
    }
    
    const daily = dailyMap.get(date)!;
    if (log.action === 'IN') {
      daily.checkIns++;
    } else if (log.action === 'OUT') {
      daily.checkOuts++;
    }
    
    if (log.employeeId) {
      daily.employees.add(log.employeeId);
    }
  });

  const activities: DailyActivity[] = [];
  dailyMap.forEach((data, date) => {
    activities.push({
      date,
      checkIns: data.checkIns,
      checkOuts: data.checkOuts,
      totalHours: Math.min(data.checkIns, data.checkOuts) * 8, // Simplified calculation
      employees: data.employees
    });
  });

  return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function exportWorkSummaryCSV(summaries: WorkSummary[]): void {
  const headers = [
    'Employee ID',
    'Name', 
    'Total Hours',
    'Total Days',
    'Check-ins',
    'Check-outs',
    'Average Hours/Day',
    'First Activity',
    'Last Activity'
  ];
  
  const csvContent = [
    headers.join(','),
    ...summaries.map(summary => [
      summary.employeeId,
      `"${summary.name}"`,
      summary.totalHours,
      summary.totalDays,
      summary.checkIns,
      summary.checkOuts,
      summary.averageHoursPerDay.toFixed(2),
      `"${summary.firstActivity}"`,
      `"${summary.lastActivity}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `work-summary-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}