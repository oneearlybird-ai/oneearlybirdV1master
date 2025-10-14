"use client";

import { ButtonHTMLAttributes } from "react";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

type AuthModalTriggerButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  mode: "signin" | "signup";
};

export default function AuthModalTriggerButton(props: AuthModalTriggerButtonProps) {
  const { mode, onClick, children, type, ...rest } = props;
  const { open } = useAuthModal();

  return (
    <button
      type={type ?? "button"}
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        open(mode);
      }}
    >
      {children}
    </button>
  );
}

