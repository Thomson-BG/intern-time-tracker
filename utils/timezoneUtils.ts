// Utility functions for timezone handling based on GPS coordinates

export async function getTimezoneFromCoordinates(latitude: number, longitude: number): Promise<string> {
  try {
    // Use a free timezone API service
    const response = await fetch(`https://api.timeapi.io/api/Time/current/coordinate?latitude=${latitude}&longitude=${longitude}`);
    
    if (response.ok) {
      const data = await response.json();
      return data.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
  } catch (error) {
    console.warn('Could not fetch timezone from coordinates, using local timezone:', error);
  }
  
  // Fallback to system timezone
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function createTimestampWithTimezone(timezone: string): string {
  try {
    const now = new Date();
    // Create timestamp in the specified timezone
    const timeInTimezone = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(now);

    // Reconstruct ISO-like format
    const parts = timeInTimezone.reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {} as any);

    const isoString = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
    
    // Add timezone offset information
    const date = new Date(now.toLocaleString("en-US", {timeZone: timezone}));
    const utcDate = new Date(now.toLocaleString("en-US", {timeZone: "UTC"}));
    const offsetMinutes = (utcDate.getTime() - date.getTime()) / (1000 * 60);
    const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
    const offsetMins = Math.abs(offsetMinutes) % 60;
    const offsetSign = offsetMinutes <= 0 ? '+' : '-';
    const offsetString = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMins.toString().padStart(2, '0')}`;
    
    return `${isoString}${offsetString}`;
  } catch (error) {
    console.warn('Error creating timezone-specific timestamp, using UTC:', error);
    return new Date().toISOString();
  }
}

export async function createGPSTimestamp(latitude?: number, longitude?: number): Promise<string> {
  if (!latitude || !longitude) {
    // No GPS coordinates, use local time
    return new Date().toISOString();
  }

  try {
    const timezone = await getTimezoneFromCoordinates(latitude, longitude);
    return createTimestampWithTimezone(timezone);
  } catch (error) {
    console.warn('Error creating GPS-based timestamp, using UTC:', error);
    return new Date().toISOString();
  }
}