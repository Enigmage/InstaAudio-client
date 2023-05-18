import React from 'react';
import { Button } from 'react-native-paper';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';

export const MIMETYPES = [
  DocumentPicker.types.pdf,
  // DocumentPicker.types.doc,
  DocumentPicker.types.plainText,
];

export default function PickerButton() {
  const handlePress = async () => {
    try {
      const resp: Array<DocumentPickerResponse> =
        await DocumentPicker.pickMultiple({ type: MIMETYPES });
      console.log(resp);
    } catch (_) {
      console.log('cancelled');
    }
  };
  return (
    <Button icon="file-image-plus" mode="elevated" onPress={handlePress}>
      Convert File
    </Button>
  );
}
