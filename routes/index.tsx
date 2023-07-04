import { Head } from "$fresh/runtime.ts";
import Listener from "../islands/Listener.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Voice 2 GPT</title>
        <style>
          {`/* width */
::-webkit-scrollbar {
  width: 3px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}`}
        </style>
      </Head>
      <main class="bg-black h-screen flex flex-col justify-center items-center">
        <div>
          <h2 class="text-white text-2xl text-center">
            Welcome to Voice 2 GPT
          </h2>
          <p class="text-white text-center -translate-y-2 scale-90">
            Press the button and talk with GPT.
          </p>
        </div>
        <Listener privateKey={Deno.env.get("GPT_SECRET_TOKEN")!} />
      </main>
      <footer></footer>
    </>
  );
}
