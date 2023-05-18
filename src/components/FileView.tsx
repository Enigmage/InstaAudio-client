import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {FlatList} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import {
  Card,
  Text as PaperText,
  Avatar,
  IconButton,
  MD3Colors,
  ProgressBar,
} from 'react-native-paper';
import RNFS, {ReadDirItem} from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';

import {bytesToMB, getFileExtension, getFileName} from '../utils';
import {DEV_API_URL} from '../constants';

export interface ShareFile {
  filePath?: string;
  text?: string;
  weblink?: string;
  mimeType?: string;
  contentUri?: string;
  fileName?: string;
  extension?: string;
}

export const AUDIOBOOKSPATH = `${RNFS.ExternalDirectoryPath}/audiobooks`;

export default function FileView() {
  console.log('re-rendering fileview');
  const [fileView, setFileView] = useState<Array<ReadDirItem>>([]);
  const [loading, setLoading] = useState(false);
  // console.log(shareFiles);
  useEffect(() => {
    setupAndReadAudiobooksDir();
  }, []);

  const convertIntentData = async (shareFiles: ShareFile[]) => {
    try {
      const conversionUrl = `${DEV_API_URL}/convert`;
      const intentData: ShareFile | undefined = shareFiles.pop();
      if (intentData?.weblink) {
        let formattedUrl = intentData.weblink.replace(
          /^(https?:\/\/)?(www\.)?/,
          '',
        );
        // Replace slashes with hyphens
        formattedUrl = formattedUrl.replace(/\//g, '-').substring(0, 30);
        const downloadPath = `${AUDIOBOOKSPATH}/${formattedUrl}.mp3`;
        const jsonBody = {link: intentData.weblink};
        console.log(intentData.weblink);
        setLoading(true);
        const res = await RNFetchBlob.config({
          path: downloadPath,
          timeout: 50_000,
        }).fetch(
          'POST',
          conversionUrl,
          {
            'Content-Type': 'application/json',
          },
          JSON.stringify(jsonBody),
        );
        setLoading(false);
        console.log(`Downloaded file to: ${res.path()}`);
        // await readAudiobooksDir(AUDIOBOOKSPATH);
      } else {
      }
    } catch (err) {
      console.error(err);
    }
  };

  const readAudiobooksDir = async (path: string) => {
    try {
      const data = await RNFS.readDir(path);
      setFileView(data);
    } catch (err) {
      console.error(err);
    }
  };

  const setupAndReadAudiobooksDir = async () => {
    try {
      await RNFS.mkdir(AUDIOBOOKSPATH);
      ReceiveSharingIntent.getReceivedFiles(
        (newfiles: Array<ShareFile>) => {
          // files returns as JSON Array example
          //[{ filePath: null, text: null, weblink: null, mimeType: null, contentUri: null, fileName: null, extension: null }]
          console.log(newfiles);
          if (newfiles) convertIntentData(newfiles);
        },
        (error: any) => {
          console.log(error);
        },
        'InstaAudioMedia', // share url protocol (must be unique to your app, suggest using your apple bundle id)
      );
      await readAudiobooksDir(AUDIOBOOKSPATH);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (item: ReadDirItem) => async () => {
    try {
      await RNFS.unlink(item.path);
      await readAudiobooksDir(AUDIOBOOKSPATH);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlay = (item: ReadDirItem) => async () => {
    console.log(`Path of file: ${item.path}`);
    try {
      await FileViewer.open(item.path, {showOpenWithDialog: true});
      console.log('Success');
    } catch (err) {
      console.error(err);
    }
  };

  const renderFileView = ({item}: {item: ReadDirItem}) => {
    const LeftContent = (props: {size: number}) => (
      <Avatar.Icon {...props} icon="book-music" />
    );
    return item.isFile() && getFileExtension(item.name) === 'mp3' ? (
      <Card mode="elevated">
        <Card.Title title="Audio" left={LeftContent} />
        <Card.Content>
          <PaperText variant="titleMedium">{getFileName(item.name)}</PaperText>
          <PaperText variant="bodySmall">{item.mtime?.toUTCString()}</PaperText>
          <PaperText variant="bodySmall">{bytesToMB(item.size)}</PaperText>
        </Card.Content>
        <Card.Actions>
          <IconButton
            icon="delete"
            mode="outlined"
            size={15}
            iconColor={MD3Colors.neutralVariant99}
            containerColor={MD3Colors.error70}
            onPress={handleDelete(item)}
          />
          <IconButton
            icon="archive-star"
            size={15}
            onPress={() => console.log('star')}
          />
          <IconButton icon="play" size={15} onPress={handlePlay(item)} />
        </Card.Actions>
      </Card>
    ) : null;
  };
  return !loading ? (
    <FlatList
      data={fileView}
      renderItem={renderFileView}
      keyExtractor={(item: ReadDirItem) => item.path}
      ItemSeparatorComponent={() => <View style={{height: 10}} />}
    />
  ) : (
    <View>
      <ProgressBar progress={0.5} color={MD3Colors.error50} />
    </View>
  );
}
