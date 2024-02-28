import Image from "next/image";
import React from "react";
import { signIn } from "next-auth/react";

export default function GoogleSignUpButton() {
  return (
    <button
      type="button"
      className="w-fit block mx-auto mt-6"
      onClick={() => signIn("google", {}, { prompt: "login" })}
    >
      <Image
        src="/images/google-sign-up.png"
        alt="Sign up with Google"
        width="167"
        height="40"
      />
    </button>
  );
}
