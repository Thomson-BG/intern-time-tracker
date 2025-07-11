export interface TimeEntry {
  action: 'IN' | 'OUT';
  timestamp: string;
  rawTimestamp: number;
}

export interface WorkSession {
  checkIn: TimeEntry;
  checkOut?: TimeEntry;
  duration?: number; // in minutes
  isComplete: boolean;
}

export function calculateWorkSessions(logs: TimeEntry[]): WorkSession[] {
  const sessions: WorkSession[] = [];
  const sortedLogs = [...logs].sort((a, b) => a.rawTimestamp - b.rawTimestamp);
  
  let currentSession: WorkSession | null = null;
  
  for (const log of sortedLogs) {
    if (log.action === 'IN') {
      // Start new session
      if (currentSession && !currentSession.isComplete) {
        // Previous session was not completed, mark as incomplete
        sessions.push(currentSession);
      }
      currentSession = {
        checkIn: log,
        isComplete: false
      };
    } else if (log.action === 'OUT' && currentSession) {
      // Complete current session
      const duration = Math.round((log.rawTimestamp - currentSession.checkIn.rawTimestamp) / (1000 * 60));
      currentSession.checkOut = log;
      currentSession.duration = duration;
      currentSession.isComplete = true;
      sessions.push(currentSession);
      currentSession = null;
    }
  }
  
  // Add incomplete session if exists
  if (currentSession) {
    sessions.push(currentSession);
  }
  
  return sessions;
}

export function calculateTotalHours(sessions: WorkSession[]): {
  totalMinutes: number;
  totalHours: number;
  formattedTime: string;
  completedSessions: number;
  incompleteSessions: number;
} {
  const completedSessions = sessions.filter(s => s.isComplete);
  const incompleteSessions = sessions.filter(s => !s.isComplete);
  
  const totalMinutes = completedSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const totalHours = totalMinutes / 60;
  
  const hours = Math.floor(totalHours);
  const minutes = totalMinutes % 60;
  const formattedTime = `${hours}h ${minutes}m`;
  
  return {
    totalMinutes,
    totalHours,
    formattedTime,
    completedSessions: completedSessions.length,
    incompleteSessions: incompleteSessions.length
  };
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function isValidWorkingHours(checkInTime: Date, checkOutTime: Date): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const duration = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60); // hours
  
  // Check for reasonable duration (less than 24 hours)
  if (duration > 24) {
    issues.push('Work session longer than 24 hours detected');
  }
  
  // Check for very short sessions (less than 5 minutes)
  if (duration < (5 / 60)) {
    issues.push('Work session shorter than 5 minutes detected');
  }
  
  // Check for overnight sessions
  if (checkInTime.getDate() !== checkOutTime.getDate()) {
    issues.push('Work session spans multiple days');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}