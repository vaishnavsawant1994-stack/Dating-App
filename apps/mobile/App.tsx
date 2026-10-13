import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/errors/error-boundary';
import { RootNavigator } from './src/navigation/root-navigation';
import { NetworkProvider } from './src/network/network-provider';
import { navigationTheme } from './src/theme/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <NetworkProvider>
          <NavigationContainer theme={navigationTheme}>
            <StatusBar style="auto" />
            <RootNavigator />
          </NavigationContainer>
        </NetworkProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
