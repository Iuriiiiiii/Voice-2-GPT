import { Ref, useEffect, useId, useState } from "preact/hooks";
import { useGPT35 } from "../hooks/index.ts";
import { ChatCompletionStream } from "../libs/openai/types.ts";
import { stopSignal } from "../islands/Listener.tsx";
import { useSignal } from "@preact/signals";

interface IProps {
  privateKey: string;
  message: string;
  gptAnswer?: string;
  parentRef: Ref<HTMLDivElement>;
}

export function Message({ privateKey, message, gptAnswer, parentRef }: IProps) {
  const answer = useSignal("");
  const { useStreamReader, chat } = useGPT35({
    credentials: {
      privateKey,
    },
    stream: true,
  });

  if (!gptAnswer) {
    useEffect(function () {
      parentRef.current?.scrollTo({ top: Number.MAX_SAFE_INTEGER });
      chat(message);
    }, []);

    useStreamReader(function (chunk: ChatCompletionStream) {
      const { content } = chunk.choices[0].delta;

      if (content) {
        answer.value += content;
      }

      parentRef.current?.scrollTo({ top: Number.MAX_SAFE_INTEGER });
      return stopSignal.value === false;
    });
  }

  return (
    <div class="text-white" key={useId()}>
      <p class="text-center font-bold">{message}</p>
      <p class="text-center">{gptAnswer || answer.value}</p>
    </div>
  );
}
