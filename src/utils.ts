import { ReadDirItem } from 'react-native-fs';

export const bytesToMB = (bytes: number) => {
  const megabytes = bytes / (1024 * 1024);
  return megabytes.toFixed(2) + ' MB';
};

export const bytesToKB = (bytes: number) => {
  const megabytes = bytes / 1024;
  return megabytes.toFixed(2) + ' KB';
};

export const getFileName = (filename: string) => {
  let fsplit = filename.split('.');
  fsplit.pop();
  return fsplit.join('.');
};

export const sortByMtime =
  (sortOrder: 'asc' | 'desc') => (a: ReadDirItem, b: ReadDirItem) => {
    const dA = new Date(`${a.mtime}`).valueOf();
    const dB = new Date(`${b.mtime}`).valueOf();
    if (dA > dB) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return sortOrder === 'asc' ? -1 : 1;
  };

export const getFileExtension = (filename: string) => filename.split('.').pop();
