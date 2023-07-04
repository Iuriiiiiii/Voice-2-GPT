import {
  ChatMessageType,
  OpenAIModels,
  RecognitionStatus,
} from "../enums/index.ts";
import { GPT35StreamCallback } from "../types/index.ts";

export interface SpeechGrammar {
  src: string;
  weight: number | undefined;
}

export interface SpeechGrammarList {
  [index: number]: SpeechGrammar;
  readonly length: number;
  addFromURI(src: string, weight: number | undefined): void;
  addFromString(src: string, weight: number | undefined): void;
}

export interface SpeechRecognition extends EventTarget {
  grammars: SpeechGrammarList;
  lang: string;
  continuous: boolean | undefined;
  interimResults: boolean | undefined;
  maxAlternatives: number;
  onaudiostart: (event: unknown) => void;
  onsoundstart: (event: unknown) => void;
  onspeechstart: (event: unknown) => void;
  onspeechend: (event: unknown) => void;
  onsoundend: (event: unknown) => void;
  onaudioend: (event: unknown) => void;
  onresult: (event: unknown) => void;
  onnomatch: (event: unknown) => void;
  onerror: (event: unknown) => void;
  onstart: (event: unknown) => void;
  onend: (event: unknown) => void;
  abort(): void;
  start(): void;
  stop(): void;
}

export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface RecognitionInformation
  extends Pick<SpeechRecognition, "start" | "stop" | "abort"> {
  status: RecognitionStatus;
  command: string;
  recognized: string;
  event: unknown;
}

export interface ChatMessage {
  type: ChatMessageType;
  message: string;
}

export interface GTP35Credentials {
  privateKey: string;
}

export interface GPT35Options {
  credentials: GTP35Credentials;
  model?: OpenAIModels;
  stream?: boolean;
}

export interface GPT35HookData {
  chat(message: string): void;
  readonly response: string;
  readonly messages: ChatMessage[];
  writeMessage(message: string): void;
  useStreamReader(callback: GPT35StreamCallback): void;
}
