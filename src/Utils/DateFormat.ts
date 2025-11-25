export const formatDate = (value: string | null | undefined): string => {
    if (!value) return '-';

    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value); // not a date

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 0-indexed
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year}, ${hours}:${minutes}`;
};
