"use client";

import { EyeFilledIcon } from "@app/components/icon/EyeFilledIcon";
import { EyeSlashFilledIcon } from "@app/components/icon/EyeSlashFilledIcon";
import { MailIcon } from "@app/components/icon/MailIcon";
import { useAuthContext } from "@app/contexts/useAuthContext";
import { singUp } from "@app/services/authService";
import { Button, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const { setIsLoggedIn } = useAuthContext();
  const router = useRouter();

  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors([]);
    try {
      await singUp({ email, password, passwordConfirmation });
      setIsLoggedIn(true);
      router.push("/");
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors.full_messages);
        console.log(error.response.data.errors);
      } else {
        setErrors(["登録に失敗しました"]);
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {errors.map((error, index) => (
          <ul key={index}>
            <li>{error}</li>
          </ul>
        ))}
        <Input
          onChange={(e) => setEmail(e.target.value)}
          className="caret-zinc-400"
          type="email"
          label="Email"
          placeholder="you@example.com"
          labelPlacement="outside"
          startContent={
            <MailIcon
              aria-hidden={true}
              fill="#71717A"
              focusable={false}
              height="1em"
              role="presentation"
              viewBox="0 0 24 24"
              width="1em"
              className="text-2xl text-default-400 pointer-events-none flex-shrink-0"
            />
          }
        />
        <Input
          onChange={(e) => setPassword(e.target.value)}
          className="caret-zinc-400"
          label="Password"
          placeholder="Enter your password"
          labelPlacement="outside"
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={togglePasswordVisibility}
            >
              {isPasswordVisible ? (
                <EyeSlashFilledIcon
                  aria-hidden={true}
                  fill="#71717A"
                  focusable={false}
                  height="1em"
                  role="presentation"
                  viewBox="0 0 24 24"
                  width="1em"
                  className="text-2xl text-default-400 pointer-events-none"
                />
              ) : (
                <EyeFilledIcon
                  aria-hidden={true}
                  fill="#71717A"
                  focusable={false}
                  height="1em"
                  role="presentation"
                  viewBox="0 0 24 24"
                  width="1em"
                  className="text-2xl text-default-400 pointer-events-none"
                />
              )}
            </button>
          }
          type={isPasswordVisible ? "text" : "password"}
        />
        <Input
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          label="Password Confirmation"
          placeholder="Enter your password"
          labelPlacement="outside"
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleConfirmVisibility}
            >
              {isConfirmVisible ? (
                <EyeSlashFilledIcon
                  aria-hidden={true}
                  fill="#71717A"
                  focusable={false}
                  height="1em"
                  role="presentation"
                  viewBox="0 0 24 24"
                  width="1em"
                  className="text-2xl text-default-400 pointer-events-none"
                />
              ) : (
                <EyeFilledIcon
                  aria-hidden={true}
                  fill="#71717A"
                  focusable={false}
                  height="1em"
                  role="presentation"
                  viewBox="0 0 24 24"
                  width="1em"
                  className="text-2xl text-default-400 pointer-events-none"
                />
              )}
            </button>
          }
          type={isConfirmVisible ? "text" : "password"}
          className="caret-zinc-400"
        />
        <Button className="bg-yellow-500" type="submit">
          登録する
        </Button>
      </form>
    </>
  );
}
