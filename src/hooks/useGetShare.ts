import { useEffect, useState } from 'react';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';

export interface ShareFile {
  filePath?: string;
  text?: string;
  weblink?: string;
  mimeType?: string;
  contentUri?: string;
  fileName?: string;
  extension?: string;
}

export const useGetShare = (): ShareFile[] => {
  const [files, setFiles] = useState<Array<ShareFile>>([]);

  useEffect(() => {
    // To get All Recived Urls
    ReceiveSharingIntent.getReceivedFiles(
      (newfiles: Array<ShareFile>) => {
        // files returns as JSON Array example
        //[{ filePath: null, text: null, weblink: null, mimeType: null, contentUri: null, fileName: null, extension: null }]
        setFiles(newfiles);
      },
      (error: any) => {
        console.log(error);
      },
      'InstaAudioMedia', // share url protocol (must be unique to your app, suggest using your apple bundle id)
    );
    return () => ReceiveSharingIntent.clearReceivedFiles();
  }, []);
  return files;
};
