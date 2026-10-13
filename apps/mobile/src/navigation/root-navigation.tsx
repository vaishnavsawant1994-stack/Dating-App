import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EnvironmentScreen } from '../screens/environment-screen';
import { SplashScreen } from '../screens/splash-screen';
import { SystemStatusScreen } from '../screens/system-status-screen';
import { mobileColors } from '../theme/theme';
import { type RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerTintColor: mobileColors.text,
        headerStyle: { backgroundColor: mobileColors.canvas },
        contentStyle: { backgroundColor: mobileColors.canvas },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SystemStatus" component={SystemStatusScreen} options={{ title: 'System status' }} />
      <Stack.Screen name="Environment" component={EnvironmentScreen} options={{ title: 'Environment' }} />
    </Stack.Navigator>
  );
}
