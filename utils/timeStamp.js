export function IsoToTimeStamp(isoString) {
  const date = new Date(isoString);

  const weekday = date.toLocaleString("en-US", { weekday: "short" });
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();

  const formattedDate = `${weekday} ${month} ${day} ${year}-${hours}`;
  return formattedDate;
}

export function TimeStampToIso(timeStamp) {
  const parts = timeStamp.split(/[ -]/);
  const monthStr = parts[1];
  const day = parts[2];
  const year = parts[3];
  const hour = parts[4];

  const date = new Date(`${monthStr} ${day}, ${year} ${hour}:00:00`);

  return date;
}

export function isTimeInRange(target, start, end) {
  const targetDate = new Date(TimeStampToIso(target));
  const startDate = new Date(start);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  return targetDate >= startDate && targetDate < endDate;
}
