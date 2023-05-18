export const bytesToMB = (bytes: number) => {
  const megabytes = bytes / (1024 * 1024);
  return megabytes.toFixed(2) + ' MB';
};

export const getFileName = (filename: string) => {
  let fsplit = filename.split('.');
  fsplit.pop();
  return fsplit.join('.');
};
export const getFileExtension = (filename: string) => filename.split('.').pop();
