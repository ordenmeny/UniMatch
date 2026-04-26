interface TimeToStringParam {
    days: number;
    hours: number;
    minutes: number;
}
const formatDays = (days: number) => {
    if (days === 0) return "";
    if (days >= 10 && days <= 20) return `${days} дней`;
    const lastDigit = days % 10;
    if (lastDigit === 1) return `${days} день`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${days} дня`;
    return `${days} дней`;
};
const formatHours = (hours: number) => {
    if (hours === 0) return "";
    if (hours >= 10 && hours <= 20) return `${hours} часов`;
    const lastDigit = hours % 10;
    if (lastDigit === 1) return `${hours} час`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${hours} часа`;
    return `${hours} часов`;
};
const formatMinutes = (minutes: number) => {
    if (minutes === 0) return "";
    if (minutes >= 10 && minutes <= 20) return `${minutes} минут`;
    const lastDigit = minutes % 10;
    if (lastDigit === 1) return `${minutes} минуту`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${minutes} минуты`;
    return `${minutes} минут`;
};

export const formatTime = (time: TimeToStringParam) => {
    if (time.days) return formatDays(time.days);
    if (time.hours) return formatHours(time.hours);
    if (time.minutes) return formatMinutes(time.minutes);
    // return `${formatDays(time.days)} ${formatHours(time.hours)} ${formatMinutes(
    //     time.minutes
    // )}`;
};
