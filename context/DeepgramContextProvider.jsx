"use client";

import {
  createClient,
  LiveClient,
  LiveConnectionState,
  LiveTranscriptionEvents,
} from "@deepgram/sdk";

import {
  createContext,
  useContext,
  useState,
} from "react";

const DeepgramContext = createContext(undefined);

const getApiKey = async () => {
  const response = await fetch("/api/authenticate", { cache: "no-store" });
  const result = await response.json();
  return result.key;
};

const DeepgramContextProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  const [connectionState, setConnectionState] = useState(
    LiveConnectionState.CLOSED
  );

  const connectToDeepgram = async (options, endpoint) => {
    const key = await getApiKey();
    const deepgram = createClient(key);

    const conn = deepgram.listen.live(options, endpoint);

    conn.addListener(LiveTranscriptionEvents.Open, () => {
      setConnectionState(LiveConnectionState.OPEN);
    });

    conn.addListener(LiveTranscriptionEvents.Close, () => {
      setConnectionState(LiveConnectionState.CLOSED);
    });

    setConnection(conn);
  };

  const disconnectFromDeepgram = async () => {
    if (connection) {
      connection.finish();
      setConnection(null);
    }
  };

  return (
    <DeepgramContext.Provider
      value={{
        connection,
        connectToDeepgram,
        disconnectFromDeepgram,
        connectionState,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

function useDeepgram() {
  const context = useContext(DeepgramContext);
  if (context === undefined) {
    throw new Error(
      "useDeepgram must be used within a DeepgramContextProvider"
    );
  }
  return context;
}

export {
  DeepgramContextProvider,
  useDeepgram,
  LiveConnectionState,
  LiveTranscriptionEvents,
};