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

export const recieveSharingIntentInit = (
  success: (shareFiles: ShareFile[]) => Promise<void>,
): void => {
  ReceiveSharingIntent.getReceivedFiles(
    (newfiles: Array<ShareFile>) => {
      // files returns as JSON Array example
      //[{ filePath: null, text: null, weblink: null, mimeType: null, contentUri: null, fileName: null, extension: null }]
      success(newfiles);
    },
    (_: any) => {
      console.log('No file received');
    },
    'InstaAudioMedia', // share url protocol (must be unique to your app, suggest using your apple bundle id)
  );
};
