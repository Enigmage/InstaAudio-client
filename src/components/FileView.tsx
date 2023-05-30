import React, { useEffect, useState } from 'react';
import { View, Platform, PermissionsAndroid, Alert } from 'react-native';
import { FlatList } from 'react-native';
import FileViewer from 'react-native-file-viewer';
import { MD3Colors, ProgressBar, FAB, Menu } from 'react-native-paper';
import RNFS, { ReadDirItem } from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';

import { DEV_API_URL, AUDIOBOOKSPATH, MIMETYPES } from '../constants';
import FileCard from './FileCard';

export interface ShareFile {
  filePath?: string;
  text?: string;
  weblink?: string;
  mimeType?: string;
  contentUri?: string;
  fileName?: string;
  extension?: string;
}

export default function FileView() {
  // console.log('re-rendering fileview');
  const [fileView, setFileView] = useState<Array<ReadDirItem>>([]);
  const [loading, setLoading] = useState(false);
  const [visibleSortMenu, setVisibleSortMenu] = useState(false);
  const [fileOrder, setFileOrder] = useState<'asc' | 'desc'>('desc');
  // console.log(shareFiles);
  useEffect(() => {
    setupAndReadAudiobooksDir();
  }, []);

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
      await readAudiobooksDir(AUDIOBOOKSPATH, fileOrder);
    } catch (err) {
      console.error(err);
    }
  };
  const readAudiobooksDir = async (path: string, sortOrder: 'asc' | 'desc') => {
    try {
      const data = await RNFS.readDir(path);
      const sortedData = data.sort((a, b) => {
        const dA = new Date(`${a.mtime}`).valueOf();
        const dB = new Date(`${b.mtime}`).valueOf();
        if (dA > dB) {
          return sortOrder === 'asc' ? 1 : -1;
        }
        return sortOrder === 'asc' ? -1 : 1;
      });
      setFileView(sortedData);
    } catch (err) {
      console.error(err);
    }
  };
  const convertFile = async (
    filepath: string,
    filename: string,
    filetype: string,
  ): Promise<void> => {
    const conversionUrl = `${DEV_API_URL}/convert-file`;
    const downloadPath = `${AUDIOBOOKSPATH}/${filename}.mp3`;
    setLoading(true);
    const res = await RNFetchBlob.config({
      path: downloadPath,
      timeout: 50_000,
    }).fetch('POST', conversionUrl, { 'Content-Type': 'multipart/form-data' }, [
      {
        name: 'file',
        filename: filename,
        type: filetype,
        data: RNFetchBlob.wrap(filepath),
      },
    ]);
    setLoading(false);
    console.log(`Downloaded file to: ${res.path()}`);
  };

  const convertIntentData = async (shareFiles: ShareFile[]) => {
    const intentData: ShareFile | undefined = shareFiles.pop();
    if (intentData) {
      try {
        if (intentData.weblink) {
          const conversionUrl = `${DEV_API_URL}/convert-url`;
          let formattedUrl = intentData.weblink.replace(
            /^(https?:\/\/)?(www\.)?/,
            '',
          );
          // Replace slashes with hyphens
          formattedUrl = formattedUrl.replace(/\//g, '-').substring(0, 30);
          const downloadPath = `${AUDIOBOOKSPATH}/${formattedUrl}.mp3`;
          const jsonBody = { url: intentData.weblink };
          // console.log(intentData.weblink);
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
          await readAudiobooksDir(AUDIOBOOKSPATH, fileOrder);
        } else if (intentData.filePath) {
          await convertFile(
            intentData.filePath,
            intentData.fileName || 'Unknown',
            intentData.mimeType || '',
          );
          await readAudiobooksDir(AUDIOBOOKSPATH, fileOrder);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = (item: ReadDirItem) => async () => {
    try {
      await RNFS.unlink(item.path);
      await readAudiobooksDir(AUDIOBOOKSPATH, fileOrder);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRename = async (item: ReadDirItem, newName: string) => {
    const newPath = `${AUDIOBOOKSPATH}/${newName}.mp3`;
    const currPath = item.path;
    await RNFS.moveFile(currPath, newPath);
    await readAudiobooksDir(AUDIOBOOKSPATH, fileOrder);
  };
  const handlePlay = (item: ReadDirItem) => async () => {
    // console.log(`Path of file: ${item.path}`);
    try {
      await FileViewer.open(item.path, { showOpenWithDialog: true });
      // console.log('Success');
    } catch (err) {
      console.log(err);
    }
  };
  const handleExport = (item: ReadDirItem) => async () => {
    if (Platform.OS !== 'android') return;
    // console.log(Platform.OS);
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Write permission: InstaAudio',
          message: 'Allow the file to be copied to downloads directory',
          buttonPositive: 'Allow',
          buttonNegative: 'Cancel',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const currPath = item.path;
        const newPath = `${RNFS.DownloadDirectoryPath}/${item.name}`;
        await RNFS.copyFile(currPath, newPath);
        console.log('exported');
        Alert.alert('File Exported', '', [{ text: 'OK' }]);
      } else {
        console.log('Permission denied');
      }
      return;
    } catch (err) {
      console.warn(err);
      return;
    }
  };

  const handleConvertButton = async () => {
    try {
      const resp: DocumentPickerResponse = await DocumentPicker.pickSingle({
        type: MIMETYPES,
      });
      await convertFile(resp.uri, resp.name || 'Unknown', resp.type || '');
      await readAudiobooksDir(AUDIOBOOKSPATH, fileOrder);
    } catch (_) {
      console.log('cancelled');
    }
  };

  const openSortMenu = () => setVisibleSortMenu(true);
  const closeSortMenu = () => setVisibleSortMenu(false);
  const sortAscending = async () => {
    await readAudiobooksDir(AUDIOBOOKSPATH, 'asc');
    setFileOrder('asc');
  };
  const sortDescending = async () => {
    await readAudiobooksDir(AUDIOBOOKSPATH, 'desc');
    setFileOrder('desc');
  };

  const renderFileView = ({ item }: { item: ReadDirItem }) => {
    return (
      <FileCard
        item={item}
        handleDelete={handleDelete}
        handlePlay={handlePlay}
        handleRename={handleRename}
        handleExport={handleExport}
      />
    );
  };
  return (
    <>
      {!loading ? (
        <FlatList
          data={fileView}
          renderItem={renderFileView}
          keyExtractor={(item: ReadDirItem) => item.path}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      ) : (
        <ProgressBar animatedValue={0.5} color={MD3Colors.error50} />
      )}
      {!loading && (
        <View
          style={{
            display: 'flex',
            flexDirection: 'row-reverse',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <FAB
            icon="file-image-plus"
            onPress={handleConvertButton}
            style={{
              margin: 16,
            }}
          />
          <Menu
            visible={visibleSortMenu}
            onDismiss={closeSortMenu}
            anchorPosition="top"
            anchor={
              <FAB
                icon="sort"
                onPress={openSortMenu}
                style={{
                  margin: 16,
                }}
              />
            }>
            <Menu.Item
              leadingIcon="sort-bool-ascending"
              title="Oldest first"
              onPress={sortAscending}
            />
            <Menu.Item
              leadingIcon="sort-bool-descending"
              title="Newest first"
              onPress={sortDescending}
            />
          </Menu>
        </View>
      )}
    </>
  );
}
