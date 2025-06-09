export const parseISOString = (isoString: string): { date: string, hours: number, minutes: number } => {
  const dateObj = new Date(isoString);

  // Get the date in YYYY-MM-DD format
  const date = dateObj.toISOString().split('T')[0];

  // Get hours and minutes
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();

  return { date, hours, minutes };
};

export const getTomorrow = (): Date => {
  // Get tomorrow's date as the minimum selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

export const getOneMonthAhead = (): Date => {
  const today = new Date();
  const oneMonthAhead = new Date(today.setMonth(today.getMonth() + 1));
  return oneMonthAhead;
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
