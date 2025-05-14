// Converts a date string to a human-readable date string (YYYY-MM-DD)
export const convertDateISOtoYYYYMMD = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

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
}

export const convertYYYYMMDtoISO = (formattedDate: string): string => {
  // Split the formatted date into parts
  const [dayWithOrdinal, month, year] = formattedDate.split(' ');
  
  // Remove ordinal suffix from day
  const day = dayWithOrdinal.replace(/(\d+)(st|nd|rd|th)/, '$1');
  
  // Convert month name to month number (1-12)
  const monthNumber = new Date(`${month} 1, 2000`).getMonth() + 1;
  
  // Format as ISO 8601 (YYYY-MM-DD)
  const paddedMonth = monthNumber < 10 ? `0${monthNumber}` : monthNumber;
  const paddedDay = parseInt(day) < 10 ? `0${day}` : day;
  
  return `${year}-${paddedMonth}-${paddedDay}`;
}

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