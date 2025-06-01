export function transformUrlPicture(items: any) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  const transformUrl = (item: any) => ({
    ...item,
    urlPicture: `${baseUrl}${item.urlPicture}`,
  });

  if (Array.isArray(items)) {
    return items.map(transformUrl);
  }

  if (items && Array.isArray(items.data)) {
    return {
      ...items,
      data: items.data.map(transformUrl),
    };
  }

  if (typeof items === 'object' && items !== null) {
    return transformUrl(items);
  }

  return items;
}
