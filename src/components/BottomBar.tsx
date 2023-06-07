import { useState } from 'react';
import { Alert, View } from 'react-native';
import {
  Menu,
  FAB,
  Portal,
  Modal,
  useTheme,
  TextInput,
  Button,
} from 'react-native-paper';
import { validateURL } from '../utils';

export interface BottomBarProps {
  sortAscending: () => Promise<void>;
  sortDescending: () => Promise<void>;
  handleConvertButton: () => Promise<void>;
  handleLinkConvertBtn: (url: string) => Promise<void>;
}

export default function BottomBar({
  sortDescending,
  sortAscending,
  handleConvertButton,
  handleLinkConvertBtn,
}: BottomBarProps) {
  const theme = useTheme();
  const [visibleSortMenu, setVisibleSortMenu] = useState(false);
  const [addLinkModal, setAddLinkModal] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const openSortMenu = () => setVisibleSortMenu(true);
  const closeSortMenu = () => setVisibleSortMenu(false);
  const hideAddLinkModal = () => setAddLinkModal(false);
  const showAddLinkModal = () => setAddLinkModal(true);

  const getAddLinkInput = async () => {
    if (validateURL(linkInput)) {
      await handleLinkConvertBtn(linkInput);
    } else {
      Alert.alert('Invalid URL!!', '', [{ text: 'OK' }]);
    }
  };
  const modalContainerStyle = {
    backgroundColor: theme.colors.background,
    color: theme.colors.primary,
    height: '40%',
    width: '100%',
    padding: 20,
  };
  return (
    <View
      style={{
        display: 'flex',
        height: '15%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Portal>
        <Modal
          visible={addLinkModal}
          onDismiss={hideAddLinkModal}
          contentContainerStyle={modalContainerStyle}>
          <TextInput
            mode="outlined"
            placeholder="Past link here"
            label="URL"
            onChangeText={text => setLinkInput(text)}
            style={{ margin: 10 }}
          />
          <Button
            disabled={linkInput.length < 6}
            mode="text"
            icon="link-plus"
            onPress={getAddLinkInput}>
            Add Link
          </Button>
        </Modal>
      </Portal>
      <FAB
        icon="file-image-plus"
        onPress={handleConvertButton}
        style={{
          margin: 16,
        }}
      />
      <FAB
        icon="link-plus"
        onPress={showAddLinkModal}
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
  );
}
