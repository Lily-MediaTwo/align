const DAY_STRING_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const toLocalDayString = (date: Date = new Date()): string => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return local.toISOString().split('T')[0];
};

export const getTodayString = (): string => toLocalDayString(new Date());

export const parseDayString = (dayString: string): Date => {
  const [year, month, day] = dayString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const normalizeInputDate = (input: Date | string): Date => {
  if (typeof input !== 'string') return input;
  if (DAY_STRING_REGEX.test(input)) return parseDayString(input);
  return new Date(input);
};

export const formatLocalDate = (
  input: Date | string,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' },
  locale?: string,
): string => {
  const date = normalizeInputDate(input);
  return date.toLocaleDateString(locale, options);
};

export const formatLocalTime = (
  input: Date | string,
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' },
  locale?: string,
): string => {
  const date = normalizeInputDate(input);
  return date.toLocaleTimeString(locale, options);
};

export const getLastNDays = (n: number, anchor: Date = new Date()): string[] => {
  return Array.from({ length: n }, (_, index) => {
    const offset = n - 1 - index;
    const day = new Date(anchor);
    day.setDate(anchor.getDate() - offset);
    return toLocalDayString(day);
  });
};

export const isSameLocalDay = (left: Date | string, right: Date | string): boolean => {
  const leftDay = toLocalDayString(normalizeInputDate(left));
  const rightDay = toLocalDayString(normalizeInputDate(right));
  return leftDay === rightDay;
};

export const isOnOrAfterDate = (value: Date | string, cutoff: Date): boolean => {
  const date = normalizeInputDate(value);
  return date.getTime() >= cutoff.getTime();
};

export const getDateDaysAgo = (days: number, anchor: Date = new Date()): Date => {
  const date = new Date(anchor);
  date.setDate(anchor.getDate() - days);
  return date;
};
