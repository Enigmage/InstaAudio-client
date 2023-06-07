import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import FileView from '../components/FileView';
// import PickerButton from '../components/PickerButton';
import AppTitle from '../components/Title';

export default function Home(): JSX.Element {
  const theme = useTheme();
  return (
    <View style={[styles.main, { backgroundColor: theme.colors.background }]}>
      <View style={styles.titleView}>
        <AppTitle />
      </View>
      <View style={styles.filesView}>
        <FileView />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  main: {
    display: 'flex',
    flex: 1,
  },
  titleView: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 30,
  },
  filesView: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    flex: 9,
  },
});
