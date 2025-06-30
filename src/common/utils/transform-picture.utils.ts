export function transformUrlPicture(item: any): any {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  if (item instanceof Date) {
    return item.toISOString(); // atau biarkan return item;
  }

  if (Array.isArray(item)) {
    return item.map(transformUrlPicture);
  }

  if (item !== null && typeof item === 'object') {
    const result: any = {};
    for (const key in item) {
      if (key === 'urlPicture' && typeof item[key] === 'string') {
        result[key] = `${baseUrl}${item[key]}`;
      } else {
        result[key] = transformUrlPicture(item[key]);
      }
    }
    return result;
  }

  return item;
}
