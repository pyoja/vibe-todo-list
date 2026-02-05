import { addDays, setHours, setMinutes, startOfToday } from "date-fns";

export interface ParsedContent {
  content: string;
  dueDate: Date | null;
}

export function parseDateFromContent(text: string): ParsedContent {
  const today = startOfToday();
  let targetDate: Date | null = null;
  let cleanText = text;

  // 1. Date Keywords
  const datePatterns = [
    { regex: /오늘/, daysToAdd: 0 },
    { regex: /내일/, daysToAdd: 1 },
    { regex: /모레/, daysToAdd: 2 },
  ];

  for (const pattern of datePatterns) {
    if (pattern.regex.test(cleanText)) {
      targetDate = addDays(today, pattern.daysToAdd);
      cleanText = cleanText.replace(pattern.regex, "").trim();
      break; // Only take the first date keyword
    }
  }

  // 2. Time Patterns (e.g., "오후 3시", "14시", "오전 9시 30분")
  // Regex matches: "오전/오후" (optional), Number, "시", Number (optional), "분" (optional)
  const timeRegex = /(오전|오후)?\s*(\d{1,2})시\s*((\d{1,2})분)?/g;
  const timeMatch = timeRegex.exec(cleanText);

  if (timeMatch) {
    // If we have a time but no date, assume today (or tomorrow if time passed? keep simple: today)
    if (!targetDate) {
      targetDate = today;
    }

    let hours = parseInt(timeMatch[2], 10);
    const minutes = timeMatch[4] ? parseInt(timeMatch[4], 10) : 0;
    const period = timeMatch[1]; // "오전" or "오후"

    // Handle 12-hour format
    if (period === "오후" && hours < 12) {
      hours += 12;
    }
    if (period === "오전" && hours === 12) {
      hours = 0;
    }

    targetDate = setMinutes(setHours(targetDate, hours), minutes);

    // Remove time string from content
    cleanText = cleanText.replace(timeMatch[0], "").trim();
  } else if (targetDate) {
    // If date set but no time, default to End of Day (23:59) or just date?
    // Let's default to not setting specific time, just the date object (which defaults to 00:00 usually, or we can set to 9am)
    // For now, let's keep it as start of day for simple dates.
  }

  // Cleanup extra spaces
  cleanText = cleanText.replace(/\s+/g, " ").trim();

  return {
    content: cleanText,
    dueDate: targetDate,
  };
}
