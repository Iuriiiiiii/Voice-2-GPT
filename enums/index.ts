export enum RecognitionStatus {
  Uninitialized = "Uninitialized",
  Incompatible = "Incompatible",
  Listening = "Listening",
  Recognized = "Recognized",
  Stopped = "Stopped",
  NoMatch = "NoMatch",
  Error = "Error",
  SpeechEnd = "SpeechEnd",
  Command = "Command",
}

export enum ChatMessageType {
  User = "User",
  GPT = "GPT",
  Internal = "Internal",
}

export enum OpenAIModels {
  GPT35 = "gpt-3.5-turbo",
}
