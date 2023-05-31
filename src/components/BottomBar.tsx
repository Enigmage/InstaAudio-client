import { useState } from 'react';
import { View } from 'react-native';
import { Menu, FAB } from 'react-native-paper';

export interface BottomBarProps {
  sortAscending: () => Promise<void>;
  sortDescending: () => Promise<void>;
  handleConvertButton: () => Promise<void>;
}

export default function BottomBar({
  sortDescending,
  sortAscending,
  handleConvertButton,
}: BottomBarProps) {
  const [visibleSortMenu, setVisibleSortMenu] = useState(false);
  const openSortMenu = () => setVisibleSortMenu(true);
  const closeSortMenu = () => setVisibleSortMenu(false);
  return (
    <View
      style={{
        display: 'flex',
        height: '10%',
        flexDirection: 'row',
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
  );
}
