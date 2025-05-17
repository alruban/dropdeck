export const createISOString = (date: string, hours?: number, minutes?: number): string => {
  // Create a date object from the date string
  const dateObj = new Date(date);

  // Set the hours and minutes
  if (hours && minutes) {
    dateObj.setHours(hours, minutes, 0, 0);
  }

  // Return ISO string
  return dateObj.toISOString();
};

export const parseISOString = (isoString: string): { date: string, hours: number, minutes: number } => {
  const dateObj = new Date(isoString);

  // Get the date in YYYY-MM-DD format
  const date = dateObj.toISOString().split('T')[0];

  // Get hours and minutes
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();

  return { date, hours, minutes };
};

export const getOneMonthAhead = (): string => {
  const today = new Date();
  const oneMonthAhead = new Date(today.setMonth(today.getMonth() + 1));
  return oneMonthAhead.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
}

export const createDateFromNumbers = (yyyymmdd: string): string => {
  const [year, month, day] = yyyymmdd.split('-');

  // Note: month is 0-based in JavaScript Date
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toISOString();
}

export const parseISOStringIntoFormalDate = (isoString: string): string => {
  const dateObj = new Date(isoString);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('default', { month: 'long' });
  const year = dateObj.getFullYear();

  // Add ordinal suffix to day
  const ordinal = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return `${day}${ordinal(day)} ${month} ${year}`;
};