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
} from 'react-native-paper';
import RNFS, {ReadDirItem} from 'react-native-fs';

import {bytesToMB} from '../utils';

export const AUDIOBOOKSPATH = `${RNFS.ExternalDirectoryPath}/audiobooks`;

export default function FileView() {
  const [fileView, setFileView] = useState<ReadDirItem[]>([]);

  useEffect(() => {
    setupAndReadAudiobooksDir();
  }, []);

  const readAudiobooksDir = async (path: string): Promise<void> => {
    try {
      const data = await RNFS.readDir(path);
      setFileView(data);
    } catch (err) {
      console.error(err);
    }
  };

  const setupAndReadAudiobooksDir = async (): Promise<void> => {
    try {
      await RNFS.mkdir(AUDIOBOOKSPATH);
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
    console.log(item.path);
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
    return item.isFile() && item.name.split('.').pop() === 'mp3' ? (
      <Card mode="elevated">
        <Card.Title title="Audiobook" left={LeftContent} />
        <Card.Content>
          <PaperText variant="titleMedium">{item.name.split('.')[0]}</PaperText>
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
  return (
    <FlatList
      data={fileView}
      renderItem={renderFileView}
      keyExtractor={(item: ReadDirItem) => item.path}
      ItemSeparatorComponent={() => <View style={{height: 10}} />}
    />
  );
}
