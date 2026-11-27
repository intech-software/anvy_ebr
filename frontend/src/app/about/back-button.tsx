"use client";

import { useRouter } from "next/navigation";

export function AboutBackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.replace("/");
      }}
      className="w-36 rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
    >
      OK
    </button>
  );
}
