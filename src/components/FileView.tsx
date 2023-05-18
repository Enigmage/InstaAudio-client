import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {FlatList} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import {
  Card,
  Text as PaperText,
  Avatar,
  IconButton,
  MD3Colors,
} from 'react-native-paper';
import RNFS, {ReadDirItem} from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';

import {bytesToMB, getFileExtension, getFileName} from '../utils';
import {ShareFile, useGetShare} from '../hooks/useGetShare';
import {DEV_API_URL} from '../constants';

export const AUDIOBOOKSPATH = `${RNFS.ExternalDirectoryPath}/audiobooks`;

export default function FileView() {
  const [fileView, setFileView] = useState<Array<ReadDirItem>>([]);
  const [loading, setLoading] = useState(false);
  const shareFiles: Array<ShareFile> = useGetShare();

  useEffect(() => {
    setupAndReadAudiobooksDir();
  }, [shareFiles]);

  const convertIntentData = async () => {
    try {
      const conversionUrl = `${DEV_API_URL}/convert`;
      const intentData: ShareFile = shareFiles[0];
      if (intentData.weblink) {
        let formattedUrl = intentData.weblink.replace(/^https?:\/\//, '');
        // Replace slashes with hyphens
        formattedUrl = formattedUrl.replace(/\//g, '-');
        const downloadPath = `${AUDIOBOOKSPATH}/${formattedUrl}.mp3`;
        const jsonBody = {link: intentData.weblink};
        console.log(intentData.weblink);
        setLoading(true);
        const res = await RNFetchBlob.config({
          path: downloadPath,
          timeout: 20_000,
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
      if (shareFiles.length > 0) {
        console.log('Processing...', shareFiles[0]);
        await convertIntentData();
      }
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
        <Card.Title title="Audiobook" left={LeftContent} />
        <Card.Content>
          <PaperText variant="titleMedium">{item.name}</PaperText>
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
      <Text>Loading...</Text>
    </View>
  );
}
