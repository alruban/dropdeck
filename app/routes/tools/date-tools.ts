export const parseISOStringIntoFormalDate = (isoString: string): string => {
  const dateObj = new Date(isoString);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString("default", { month: "long" });
  const year = dateObj.getFullYear();

  // Add ordinal suffix to day
  const ordinal = (day: number) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${day}${ordinal(day)} ${month} ${year}`;
};