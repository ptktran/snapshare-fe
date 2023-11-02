export function getDate(date) {
  const utcDate = new Date(date); // Assuming the input date is in UTC

  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };

  const localDate = utcDate.toLocaleString(undefined, options);

  return localDate;
}