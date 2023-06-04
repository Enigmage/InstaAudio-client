import { Text, useTheme } from 'react-native-paper';

export default function AppTitle(): JSX.Element {
  const { colors } = useTheme();
  return (
    <>
      <Text
        variant="headlineLarge"
        style={{
          color: colors.primary,
        }}>
        InstaAudio
      </Text>
      {/*<Text
        variant="labelMedium"
        style={{
          color: colors.secondary,
        }}>
        Instant Audio Summaries
      </Text>*/}
    </>
  );
}
