import { ChatCompletionStream } from "../libs/openai/types.ts";

export type GPT35StreamCallback = (chunk: ChatCompletionStream) => boolean;
