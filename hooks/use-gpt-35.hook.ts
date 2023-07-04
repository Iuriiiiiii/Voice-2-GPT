import { useEffect, useRef, useState } from "preact/hooks";
import { ChatMessageType, OpenAIModels } from "../enums/index.ts";
import {
  ChatMessage,
  GPT35HookData,
  GPT35Options,
} from "../interfaces/index.ts";
import {
  ChatCompletionOptions,
  ChatCompletionStream,
  OpenAI,
} from "../libs/openai/index.ts";
import { GPT35StreamCallback } from "../types/index.ts";

async function createChatCompletionGPT35<
  T extends GPT35StreamCallback | undefined,
  K = T extends undefined ? string : never
>(openAI: OpenAI, message: string, callback?: T): Promise<K> {
  const options: ChatCompletionOptions = {
    model: OpenAIModels.GPT35,
    messages: [{ role: "user", content: message }],
  };

  if (callback) {
    return openAI.createChatCompletionStream(options, callback) as unknown as K;
  }

  const completion = await openAI.createChatCompletion(options);

  return completion.choices.at(0)?.message.content! as K;
}

export function useGPT35(options: GPT35Options): GPT35HookData {
  const openAIRef = useRef<OpenAI>(new OpenAI(options.credentials.privateKey));
  const callbackRef = useRef<GPT35StreamCallback>(() => true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [response, setResponse] = useState<string>("");
  const openAI = openAIRef.current!;

  function writeMessage(
    message?: string,
    type: ChatMessageType = ChatMessageType.Internal
  ) {
    if (!message) {
      return;
    }

    setMessages([...messages, { message, type }]);
  }

  function callCallbackRef(chunk: ChatCompletionStream) {
    if (callbackRef.current === null) {
      return true;
    }

    return callbackRef.current(chunk);
  }

  function useStreamReader(callback: GPT35StreamCallback) {
    callbackRef.current = callback;
  }

  function callback(chunk: ChatCompletionStream) {
    const message = messages.at(-1)!;
    const answer = chunk.choices.at(0)?.delta.content!;
    const { type } = message;
    const callbackResult = callCallbackRef(chunk);

    if (type === ChatMessageType.User) {
      setMessages([
        ...messages,
        { message: answer, type: ChatMessageType.GPT },
      ]);

      return callbackResult;
    }

    message.message += answer;
    setMessages([...messages]);
    return callbackResult;
  }

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const { type, message } = messages.at(-1)!;

    switch (type) {
      case ChatMessageType.User:
        createChatCompletionGPT35(
          openAI,
          message,
          options?.stream ? callback : undefined
        )
          .then((gptMessage) => writeMessage(gptMessage!, ChatMessageType.GPT))
          .catch(console.error);
        break;
      case ChatMessageType.GPT:
        setResponse(message);
        break;
    }
  }, [messages.length, writeMessage, callback]);

  function chat(message: string) {
    writeMessage(message, ChatMessageType.User);
  }

  return {
    chat,
    messages,
    response,
    writeMessage,
    useStreamReader,
  };
}
