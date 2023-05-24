import React, {useState} from 'react';
import {
  Card,
  Avatar,
  IconButton,
  Text as PaperText,
  Menu,
} from 'react-native-paper';
import {getFileName, bytesToKB} from '../utils';
import {ReadDirItem} from 'react-native-fs';

export interface FileCardProps {
  item: ReadDirItem;
  handleDelete: (item: ReadDirItem) => () => Promise<void>;
  handlePlay: (item: ReadDirItem) => () => Promise<void>;
}

export default function FileCard({
  item,
  handleDelete,
  handlePlay,
}: FileCardProps) {
  const [visible, setVisible] = useState(false);
  const closeMenu = () => setVisible(false);
  const openMenu = () => setVisible(true);
  const LeftContent = (props: {size: number}) => (
    <Avatar.Icon {...props} icon="book-music" />
  );
  const RightContent = (props: {size: number}) => (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<IconButton {...props} icon="menu" onPress={openMenu} />}>
      <Menu.Item leadingIcon="play" title="Play" onPress={handlePlay(item)} />
      <Menu.Item
        leadingIcon="rename-box"
        title="Rename"
        onPress={() => console.log('rename')}
      />
      <Menu.Item
        leadingIcon="delete"
        title="Delete"
        onPress={handleDelete(item)}
      />
    </Menu>
  );
  return (
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
  );
}
