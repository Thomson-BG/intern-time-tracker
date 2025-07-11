// utils/productivityHelpers.ts

export interface ProductivityMetrics {
  efficiency: number; // Percentage of time actively working
  punctuality: number; // On-time arrival rate
  consistency: number; // Regular work pattern score
  overallScore: number;
}

export interface BreakAnalysis {
  averageBreakDuration: number;
  breakFrequency: number;
  longestBreak: number;
  shortestBreak: number;
}

export interface WorkPattern {
  preferredStartTime: string;
  preferredEndTime: string;
  averageWorkDuration: number;
  mostActiveDay: string;
  leastActiveDay: string;
}

export function calculateProductivityMetrics(timeLogs: any[]): Map<string, ProductivityMetrics> {
  const employeeMetrics = new Map<string, ProductivityMetrics>();
  
  // Group logs by employee
  const employeeGroups = timeLogs.reduce((groups, log) => {
    const key = log.employeeId;
    if (!groups[key]) groups[key] = [];
    groups[key].push(log);
    return groups;
  }, {} as Record<string, any[]>);

  Object.entries(employeeGroups).forEach(([employeeId, logs]) => {
    const checkIns = logs.filter(log => log.action === 'IN').sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const checkOuts = logs.filter(log => log.action === 'OUT').sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Calculate efficiency (simplified)
    const totalSessions = Math.min(checkIns.length, checkOuts.length);
    const efficiency = totalSessions > 0 ? (totalSessions / Math.max(checkIns.length, checkOuts.length)) * 100 : 0;

    // Calculate punctuality (assuming 9 AM start time)
    const expectedStartHour = 9;
    const onTimeArrivals = checkIns.filter(log => {
      const hour = new Date(log.timestamp).getHours();
      return hour <= expectedStartHour;
    }).length;
    const punctuality = checkIns.length > 0 ? (onTimeArrivals / checkIns.length) * 100 : 0;

    // Calculate consistency (regular pattern)
    const workDays = [...new Set(logs.map(log => log.timestamp.split('T')[0]))];
    const consistency = workDays.length > 0 ? Math.min((workDays.length / 30) * 100, 100) : 0; // Assuming 30-day period

    const overallScore = (efficiency + punctuality + consistency) / 3;

    employeeMetrics.set(employeeId, {
      efficiency: Math.round(efficiency),
      punctuality: Math.round(punctuality),
      consistency: Math.round(consistency),
      overallScore: Math.round(overallScore)
    });
  });

  return employeeMetrics;
}

export function analyzeWorkPatterns(timeLogs: any[]): Map<string, WorkPattern> {
  const patterns = new Map<string, WorkPattern>();
  
  // Group by employee
  const employeeGroups = timeLogs.reduce((groups, log) => {
    const key = log.employeeId;
    if (!groups[key]) groups[key] = [];
    groups[key].push(log);
    return groups;
  }, {} as Record<string, any[]>);

  Object.entries(employeeGroups).forEach(([employeeId, logs]) => {
    const checkIns = logs.filter(log => log.action === 'IN');
    const checkOuts = logs.filter(log => log.action === 'OUT');

    // Calculate preferred start time
    const startTimes = checkIns.map(log => new Date(log.timestamp).getHours());
    const avgStartTime = startTimes.length > 0 ? 
      Math.round(startTimes.reduce((sum, hour) => sum + hour, 0) / startTimes.length) : 9;

    // Calculate preferred end time
    const endTimes = checkOuts.map(log => new Date(log.timestamp).getHours());
    const avgEndTime = endTimes.length > 0 ?
      Math.round(endTimes.reduce((sum, hour) => sum + hour, 0) / endTimes.length) : 17;

    // Calculate average work duration
    const avgDuration = Math.max(0, avgEndTime - avgStartTime);

    // Find most/least active days
    const dayActivity = logs.reduce((days, log) => {
      const day = new Date(log.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
      days[day] = (days[day] || 0) + 1;
      return days;
    }, {} as Record<string, number>);

    const sortedDays = Object.entries(dayActivity).sort((a, b) => b[1] - a[1]);
    const mostActiveDay = sortedDays[0]?.[0] || 'Monday';
    const leastActiveDay = sortedDays[sortedDays.length - 1]?.[0] || 'Friday';

    patterns.set(employeeId, {
      preferredStartTime: `${avgStartTime}:00`,
      preferredEndTime: `${avgEndTime}:00`,
      averageWorkDuration: avgDuration,
      mostActiveDay,
      leastActiveDay
    });
  });

  return patterns;
}

export function generateProductivityReport(
  timeLogs: any[], 
  startDate: string, 
  endDate: string
): string {
  const filteredLogs = timeLogs.filter(log => {
    const logDate = log.timestamp.split('T')[0];
    return logDate >= startDate && logDate <= endDate;
  });

  const metrics = calculateProductivityMetrics(filteredLogs);
  const patterns = analyzeWorkPatterns(filteredLogs);

  let report = `Productivity Report (${startDate} to ${endDate})\n`;
  report += '='.repeat(50) + '\n\n';

  metrics.forEach((metric, employeeId) => {
    const pattern = patterns.get(employeeId);
    const employee = filteredLogs.find(log => log.employeeId === employeeId);
    
    report += `Employee: ${employee?.firstName} ${employee?.lastName} (${employeeId})\n`;
    report += `Overall Score: ${metric.overallScore}%\n`;
    report += `- Efficiency: ${metric.efficiency}%\n`;
    report += `- Punctuality: ${metric.punctuality}%\n`;
    report += `- Consistency: ${metric.consistency}%\n`;
    
    if (pattern) {
      report += `Work Pattern:\n`;
      report += `- Preferred hours: ${pattern.preferredStartTime} - ${pattern.preferredEndTime}\n`;
      report += `- Average duration: ${pattern.averageWorkDuration} hours\n`;
      report += `- Most active: ${pattern.mostActiveDay}\n`;
      report += `- Least active: ${pattern.leastActiveDay}\n`;
    }
    report += '\n';
  });

  return report;
}

export function exportProductivityCSV(metrics: Map<string, ProductivityMetrics>, timeLogs: any[]): void {
  const headers = [
    'Employee ID',
    'Name',
    'Overall Score',
    'Efficiency %',
    'Punctuality %',
    'Consistency %'
  ];
  
  const rows: string[] = [headers.join(',')];
  
  metrics.forEach((metric, employeeId) => {
    const employee = timeLogs.find(log => log.employeeId === employeeId);
    const name = employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
    
    rows.push([
      employeeId,
      `"${name}"`,
      metric.overallScore,
      metric.efficiency,
      metric.punctuality,
      metric.consistency
    ].join(','));
  });

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `productivity-report-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}