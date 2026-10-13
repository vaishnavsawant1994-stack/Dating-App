import { Component, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MobileButton } from '../components/mobile-button';
import { mobileColors } from '../theme/theme';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly failed: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  private readonly reset = () => {
    this.setState({ failed: false });
  };

  override render() {
    if (this.state.failed) {
      return (
        <View style={styles.container} accessibilityRole="alert">
          <Text allowFontScaling style={styles.title}>We could not load together.</Text>
          <Text allowFontScaling style={styles.detail}>Private error details are not displayed.</Text>
          <MobileButton label="Try again" onPress={this.reset} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 14,
    padding: 24,
    backgroundColor: mobileColors.canvas,
  },
  title: { color: mobileColors.text, fontSize: 24, fontWeight: '800' },
  detail: { color: mobileColors.muted, fontSize: 16, lineHeight: 23 },
});
