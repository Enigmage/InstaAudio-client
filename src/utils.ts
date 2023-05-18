export const bytesToMB = (bytes: number) => {
  const megabytes = bytes / (1024 * 1024);
  return megabytes.toFixed(2) + ' MB';
};

export const getFileName = (filename: string) => filename.split('.')[0];
export const getFileExtension = (filename: string) => filename.split('.').pop();
