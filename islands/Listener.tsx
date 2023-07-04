import { useEffect, useRef, useState } from "preact/hooks";
import { Message } from "../components/Message.tsx";
import { RecognitionStatus } from "../enums/index.ts";
import { useSpeechRecognition } from "../hooks/index.ts";
import { signal } from "https://esm.sh/*@preact/signals@1.1.3";
import { useToggle } from "../hooks/useToggle.hook.ts";
import "../node_modules/lostjs/common/index.js";

interface IProps {
  privateKey: string;
}

export const stopSignal = signal(false);

enum SpeechCommand {
  Gloria = "Gloria",
  Basta = "Basta",
  Silencio = "Silencio",
}

export default function Listener({ privateKey }: IProps) {
  const [work, setWork] = useState(false);
  const [lang, toggleLang] = useToggle<string>("es-ES", "en-US");
  const { abort, start, stop, status, recognized, command } =
    useSpeechRecognition({
      continuous: true,
      lang,
      commands: Object.values(SpeechCommand),
    });
  const [messages, setMessages] = useState<string[]>([]);
  const divRef = useRef<HTMLDivElement>(null);

  if (status === RecognitionStatus.Incompatible) {
    return <div>No Speech Recognition Support</div>;
  }

  useEffect(() => {
    setTimeout(() => (stopSignal.value = false), 250);
  }, [stopSignal.value]);

  useEffect(() => {
    switch (status) {
      case RecognitionStatus.Listening:
        setWork(true);
        break;
      case RecognitionStatus.Command:
        switch (command) {
          case SpeechCommand.Gloria:
            setMessages([...messages, recognized]);
            break;
          default:
            stopSignal.value = true;
        }

        break;
      case RecognitionStatus.Recognized:
        console.log(recognized);
        // if (getFirstWord(recognized) === "Gloria") {
        //   if (["gloriasilencio", "gloriacllate"].includes(cleanString)) {
        //     return (stopSignal.value = true) as unknown as void;
        //   }

        //   setMessages([...messages, recognized]);
        // }

        // start();
        break;

      case RecognitionStatus.SpeechEnd:
        setTimeout(() => start(), 1000);

        break;
      case RecognitionStatus.NoMatch:
      case RecognitionStatus.Error:
        start();
        break;
      case RecognitionStatus.Stopped:
        setWork(false);
    }
  }, [status]);

  return (
    <>
      <button
        class="absolute right-5 top-5 text-white"
        onClick={() => toggleLang()}
      >
        {lang}
      </button>
      <div class="flex justify-center items-center h-56">
        <div
          class={`w-44 h-44 rounded-1/2 ${
            status !== RecognitionStatus.Listening
              ? "bg-red-400"
              : "bg-green-400 animate-pulse"
          } flex justify-center items-center text-white`}
          onClick={() => (!work ? start() : stop())}
        >
          {status}
        </div>
      </div>

      <div ref={divRef} class="h-1/6 w-5/6 overflow-y-scroll">
        {messages.map((message: string, index: number) => (
          <Message
            key={index}
            parentRef={divRef}
            message={message}
            privateKey={privateKey}
          />
        ))}
      </div>
    </>
  );
}
