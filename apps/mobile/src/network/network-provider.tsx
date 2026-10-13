import NetInfo, { type NetInfoStateType } from '@react-native-community/netinfo';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface NetworkStatus {
  readonly connected: boolean | null;
  readonly internetReachable: boolean | null;
  readonly type: NetInfoStateType | 'unknown';
}

const initialStatus: NetworkStatus = {
  connected: null,
  internetReachable: null,
  type: 'unknown',
};

const NetworkContext = createContext<NetworkStatus>(initialStatus);

export function NetworkProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [status, setStatus] = useState<NetworkStatus>(initialStatus);

  useEffect(() =>
    NetInfo.addEventListener((state) => {
      setStatus({
        connected: state.isConnected,
        internetReachable: state.isInternetReachable,
        type: state.type,
      });
    }),
  []);

  const value = useMemo(() => status, [status]);
  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetworkStatus(): NetworkStatus {
  return useContext(NetworkContext);
}
