import { IS_BROWSER } from "$fresh/runtime.ts";
import { useEffect, useRef, useState } from "preact/hooks";
import { RecognitionStatus } from "../enums/index.ts";
import {
  RecognitionInformation,
  SpeechGrammar,
  SpeechGrammarList,
  SpeechRecognition,
} from "../interfaces/index.ts";

function getFirstWord(text: string) {
  const textWithoutSymbols = text
    .trim()
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "");
  const words = textWithoutSymbols.split(" ");
  let firstWord = "";

  for (let i = 0; i < words.length; i++) {
    if (words[i].match(/^[a-zA-Z0-9]+$/)) {
      firstWord = words[i];
      break;
    }
  }

  return firstWord;
}

function clearString(text: string) {
  return text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "");
}

declare global {
  interface Window {
    webkitSpeechRecognition(): SpeechRecognition;
    SpeechRecognition(): SpeechRecognition;
    webkitSpeechGrammarList(): SpeechGrammarList;
    SpeechGrammarList(): SpeechGrammarList;
  }
}

const grammar = "#JSGF V1.0; grammar names; public <name> = Gloria ;";

const defaultRecognitionReturn: RecognitionInformation = {
  status: RecognitionStatus.Uninitialized,
  recognized: "",
  command: "",
  event: undefined,
  start: () => { },
  abort: () => { },
  stop: () => { },
};

export function useSpeechRecognition(
  options?: Partial<SpeechRecognition> & {
    grammar?: SpeechGrammar[];
    commands?: string[];
  }
): RecognitionInformation {
  const [status, setStatus] = useState<RecognitionStatus>(RecognitionStatus.Uninitialized);
  const [recognized, setRecognized] = useState<string>("");
  const [command, setCommand] = useState<string>("");
  const [event, setEvent] = useState<unknown>();

  if (!IS_BROWSER) {
    return defaultRecognitionReturn;
  }

  const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
  // var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

  if (!speechRecognition || !speechGrammarList) {
    return {
      ...defaultRecognitionReturn,
      status: RecognitionStatus.Incompatible,
    };
  }
  const ref = useRef<SpeechRecognition>();
  const recognition = ref.current = new (speechRecognition as unknown as new () => SpeechRecognition)();

  if (!recognition.grammars.length) {
    const grammars = new (speechGrammarList as unknown as new () => SpeechGrammarList)();

    grammars.addFromString(grammar, 1);

    recognition.grammars = grammars;
  }

  recognition.lang = options?.lang || "en-US";
  recognition.interimResults = options?.interimResults || false;
  recognition.maxAlternatives = options?.maxAlternatives || 1;
  recognition.continuous = options?.continuous || false;

  function onRecognitionStart(event: unknown) {
    setEvent(event);
    setStatus(RecognitionStatus.Listening);
  }

  function onRecognitionResult(event: unknown) {
    setEvent(event);
    // deno-lint-ignore no-explicit-any
    const results = [...(event as any).results];
    const recognizedText = results.at(-1)[0].transcript as string;
    const recognizedCommand = options?.commands ? getFirstWord(recognizedText) : "";

    function find(command: string) {
      return clearString(recognizedCommand).toLowerCase() === clearString(command).toLowerCase();
    }

    const commandFound = options?.commands?.find(find);
    const status = commandFound ? RecognitionStatus.Command : RecognitionStatus.Recognized;

    setStatus(status);
    setRecognized(recognizedText);
    setCommand(commandFound ? commandFound : "");

    if (options?.continuous) {
      setTimeout(() => setStatus(RecognitionStatus.Listening), 50);
    }
  }

  function onRecognitionError(event: unknown) {
    setEvent(event);
    setStatus(RecognitionStatus.Error);
  }

  function onRecognitionSpeechEnd(event: unknown) {
    recognition.stop();
    setEvent(event);
    setStatus(RecognitionStatus.SpeechEnd);
  }

  function onRecognitionNoMatch(event: unknown) {
    setEvent(event);
    setStatus(RecognitionStatus.NoMatch);
  }

  useEffect(() => {
    recognition.onstart = onRecognitionStart;
    recognition.onresult = onRecognitionResult;
    recognition.onspeechend = onRecognitionSpeechEnd;
    recognition.onnomatch = onRecognitionNoMatch;
    recognition.onerror = onRecognitionError;
  }, [
    onRecognitionStart,
    onRecognitionResult,
    onRecognitionError,
    onRecognitionSpeechEnd,
    onRecognitionNoMatch,
    setStatus,
    setRecognized,
    setEvent,
  ]);

  return {
    start: () => status !== RecognitionStatus.Listening && recognition.start(),
    abort: () => status === RecognitionStatus.Listening && recognition.abort(),
    stop: () => status === RecognitionStatus.Listening && recognition.stop(),
    status,
    recognized,
    command,
    event,
  };
}
