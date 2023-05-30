import React, { useState } from 'react';
import {
  Card,
  Avatar,
  IconButton,
  Text as PaperText,
  Menu,
  Portal,
  Modal,
  useTheme,
  TextInput,
  Button,
} from 'react-native-paper';
import { getFileName, bytesToKB } from '../utils';
import { ReadDirItem } from 'react-native-fs';

export interface FileCardProps {
  item: ReadDirItem;
  handleDelete: (item: ReadDirItem) => () => Promise<void>;
  handlePlay: (item: ReadDirItem) => () => Promise<void>;
  handleExport: (item: ReadDirItem) => () => Promise<void>;
  handleRename: (item: ReadDirItem, newName: string) => Promise<void>;
}

export default function FileCard({
  item,
  handleDelete,
  handlePlay,
  handleRename,
  handleExport,
}: FileCardProps) {
  const theme = useTheme();
  const [renameText, setRenameText] = useState(getFileName(item.name));
  const [cardMenuVisible, setCardMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);
  const closeCardMenu = () => setCardMenuVisible(false);
  const openCardMenu = () => setCardMenuVisible(true);
  const handleRenameInput = async () => {
    await handleRename(item, renameText);
    console.log('File renamed!!');
  };
  const modalContainerStyle = {
    backgroundColor: theme.colors.background,
    color: theme.colors.primary,
    height: '35%',
    width: '100%',
    padding: 20,
  };
  const LeftContent = (props: { size: number }) => (
    <Avatar.Icon {...props} icon="book-music" />
  );
  const RightContent = (props: { size: number }) => (
    <Menu
      visible={cardMenuVisible}
      onDismiss={closeCardMenu}
      anchor={<IconButton {...props} icon="menu" onPress={openCardMenu} />}>
      <Menu.Item leadingIcon="play" title="Play" onPress={handlePlay(item)} />
      <Menu.Item
        leadingIcon="rename-box"
        title="Rename"
        onPress={() => {
          showModal();
          closeCardMenu();
        }}
      />
      <Menu.Item
        leadingIcon="export"
        title="Export"
        onPress={handleExport(item)}
      />
      <Menu.Item
        leadingIcon="delete"
        title="Delete"
        onPress={handleDelete(item)}
      />
    </Menu>
  );
  return (
    <>
      <Card mode="elevated">
        <Card.Title title="Audio" left={LeftContent} right={RightContent} />
        <Card.Content>
          <PaperText variant="titleMedium">{getFileName(item.name)}</PaperText>
          <PaperText variant="bodySmall">{item.mtime?.toString()}</PaperText>
          <PaperText variant="bodySmall">{bytesToKB(item.size)}</PaperText>
        </Card.Content>
        <Card.Actions>
          <IconButton
            mode="contained"
            icon="play"
            size={15}
            onPress={handlePlay(item)}
          />
        </Card.Actions>
      </Card>
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={hideModal}
          contentContainerStyle={modalContainerStyle}>
          <TextInput
            mode="outlined"
            placeholder="Filename (without ext)"
            label="Rename file"
            value={renameText}
            onChangeText={text => setRenameText(text)}
            style={{ margin: 10 }}
          />
          <Button
            mode="text"
            icon="rename-box"
            disabled={renameText.length < 3}
            onPress={handleRenameInput}>
            Rename
          </Button>
        </Modal>
      </Portal>
    </>
  );
}
