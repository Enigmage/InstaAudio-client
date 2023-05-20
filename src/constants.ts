import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';

export const AUDIOBOOKSPATH = `${RNFS.ExternalDirectoryPath}/audiobooks`;

export const MIMETYPES = [
  DocumentPicker.types.pdf,
  // DocumentPicker.types.doc,
  DocumentPicker.types.plainText,
];
export const PORT = 8000;
export const DEV_API_URL = `http://localhost:${PORT}`;
