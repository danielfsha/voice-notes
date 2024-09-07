"use client";

import { useEffect, useRef, useState } from "react";
import {
  LiveConnectionState,
  LiveTranscriptionEvents,
  useDeepgram,
} from "../context/DeepgramContextProvider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "../context/MicrophoneContextProvider";

const App = () => {
  const [caption, setCaption] = useState("Get started");
  const [note, setNote] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const { connection, connectToDeepgram, connectionState, disconnect } = useDeepgram();
  const { setupMicrophone, microphone, startMicrophone, stopMicrophone, microphoneState } =
    useMicrophone();
  const captionTimeout = useRef();
  const keepAliveInterval = useRef();

  useEffect(() => {
    setupMicrophone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = () => {
    if (microphoneState === MicrophoneState.Ready || microphoneState === MicrophoneState.Stopped) {
      setupMicrophone();
      connectToDeepgram({
        model: "nova-2",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
      });
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    stopMicrophone();
    if (disconnect) disconnect();
    setIsRecording(false);
    setCaption("Recording stopped");
  };

  useEffect(() => {
    if (!microphone || !connection || !isRecording) return;

    const onData = (e) => {
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    const onTranscript = (data) => {
      const { is_final: isFinal } = data;
      let thisCaption = data.channel.alternatives[0].transcript;

      if (thisCaption !== "") {
        setCaption(thisCaption);

        if (isFinal) {
          setNote(prevNote => prevNote + (prevNote ? " " : "") + thisCaption.trim());
        }
      }

      if (isFinal) {
        clearTimeout(captionTimeout.current);
        captionTimeout.current = setTimeout(() => {
          setCaption(undefined);
          clearTimeout(captionTimeout.current);
        }, 3000);
      }
    };

    if (connectionState === LiveConnectionState.OPEN) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

      startMicrophone();
    }

    return () => {
      connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      clearTimeout(captionTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState, isRecording, connection, microphone, startMicrophone]);

  useEffect(() => {
    if (!connection) return;

    if (
      microphoneState !== MicrophoneState.Open &&
      connectionState === LiveConnectionState.OPEN
    ) {
      connection.keepAlive();

      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive();
      }, 10000);
    } else {
      clearInterval(keepAliveInterval.current);
    }

    return () => {
      clearInterval(keepAliveInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState, connectionState]);

  const saveNotes = () => {
    const blob = new Blob([note], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'captions.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-x-hidden items-center justify-center p-4">
      <div className="mb-4">
        Status: {isRecording ? "Recording" : "Not Recording"}
      </div>
      {caption && <span className="w-full text-center mb-4">{caption}</span>}
      <div className="w-full max-w-2xl h-64 overflow-y-auto border p-4 mb-4">
        {note}
      </div>
      <div className="flex space-x-4">
        {isRecording && !note ? (
          <button
            onClick={stopRecording}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Stop Recording
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Start Recording
          </button>
        )}
        <button
          onClick={saveNotes}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Notes
        </button>
      </div>
    </div>
  );
};

export default App;