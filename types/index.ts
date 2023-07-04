import { ChatCompletionStream } from "../libs/types.ts";

export type GPT35StreamCallback = (chunk: ChatCompletionStream) => boolean;
