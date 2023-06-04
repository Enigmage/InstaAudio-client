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

export type ShareFileHandler = (fn: Array<ShareFile>) => Promise<void>;

export const recieveSharingIntentInit = (successFn: ShareFileHandler): void => {
  ReceiveSharingIntent.getReceivedFiles(
    (newfiles: Array<ShareFile>) => {
      // files returns as JSON Array example
      //[{ filePath: null, text: null, weblink: null, mimeType: null, contentUri: null, fileName: null, extension: null }]
      successFn(newfiles);
    },
    (_: any) => {
      console.log('No file received');
    },
    'InstaAudioMedia', // share url protocol (must be unique to your app, suggest using your apple bundle id)
  );
};
