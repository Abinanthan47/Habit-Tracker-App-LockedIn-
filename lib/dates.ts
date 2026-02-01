// Date formatting and utility functions

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  // Use local date components instead of toISOString (which uses UTC)
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // YYYY-MM-DD in local time
}

export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDayOfWeek(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getDay(); // 0 = Sunday, 6 = Saturday
}

export function getDayName(dayIndex: number): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[dayIndex] || "";
}

export function getFullDayName(dayIndex: number): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayIndex] || "";
}

export function getMonthName(monthIndex: number): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[monthIndex] || "";
}

export function getFullMonthName(monthIndex: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthIndex] || "";
}

export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function subtractDays(date: Date | string, days: number): Date {
  return addDays(date, -days);
}

export function getStartOfWeek(date: Date | string): Date {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

export function getStartOfMonth(date: Date | string): Date {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function getEndOfMonth(date: Date | string): Date {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getQuarter(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  return Math.floor(d.getMonth() / 3) + 1;
}

export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  return formatDate(date1) === formatDate(date2);
}

export function isToday(date: Date | string): boolean {
  return isSameDay(date, new Date());
}

export function isYesterday(date: Date | string): boolean {
  const yesterday = subtractDays(new Date(), 1);
  return isSameDay(date, yesterday);
}

export function getWeekDates(startDate: Date | string): Date[] {
  const start = getStartOfWeek(startDate);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getMonthDates(year: number, month: number): Date[] {
  const daysInMonth = getDaysInMonth(year, month);
  return Array.from(
    { length: daysInMonth },
    (_, i) => new Date(year, month, i + 1),
  );
}

export function getYearWeeks(year: number): Date[][] {
  const weeks: Date[][] = [];
  let currentDate = new Date(year, 0, 1);

  // Find first Sunday
  while (currentDate.getDay() !== 0) {
    currentDate = addDays(currentDate, -1);
  }

  // Generate all weeks until end of year
  while (currentDate.getFullYear() <= year) {
    if (currentDate.getFullYear() === year) {
      weeks.push(getWeekDates(currentDate));
    }
    currentDate = addDays(currentDate, 7);

    // Stop if we've passed the year
    if (currentDate.getFullYear() > year && currentDate.getMonth() > 0) {
      break;
    }
  }

  return weeks;
}

export function getRelativeTimeString(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// Generate dates for the contribution chart (GitHub style)
export function getContributionChartDates(
  year: number,
): { date: string; weekIndex: number; dayIndex: number }[] {
  const dates: { date: string; weekIndex: number; dayIndex: number }[] = [];
  const startDate = new Date(year, 0, 1);

  // Adjust to first Sunday
  const firstSunday = new Date(startDate);
  while (firstSunday.getDay() !== 0) {
    firstSunday.setDate(firstSunday.getDate() - 1);
  }

  let currentDate = new Date(firstSunday);
  let weekIndex = 0;

  while (
    currentDate.getFullYear() <= year ||
    (currentDate.getFullYear() === year + 1 &&
      currentDate.getMonth() === 0 &&
      currentDate.getDate() <= 7)
  ) {
    const dayIndex = currentDate.getDay();

    if (currentDate.getFullYear() === year) {
      dates.push({
        date: formatDate(currentDate),
        weekIndex,
        dayIndex,
      });
    }

    if (dayIndex === 6) {
      weekIndex++;
    }

    currentDate.setDate(currentDate.getDate() + 1);

    // Safety limit
    if (dates.length > 400) break;
  }

  return dates;
}
