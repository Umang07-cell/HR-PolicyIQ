export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidDate = (date: string) => !isNaN(Date.parse(date));
export const isDateAfter = (start: string, end: string) => new Date(end) >= new Date(start);
export const isValidMonth = (m: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(m);
