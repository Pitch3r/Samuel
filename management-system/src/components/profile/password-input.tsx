"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";

/** Letters and digits that cannot be mistaken for each other when read aloud or copied by hand. */
const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
const DIGITS = "23456789";
const ALPHABET = LETTERS + DIGITS;

/** A uniformly random index below `max`, without modulo bias. */
function randomIndex(max: number) {
  const limit = Math.floor(256 / max) * max;
  const byte = new Uint8Array(1);
  for (;;) {
    crypto.getRandomValues(byte);
    if (byte[0]! < limit) return byte[0]! % max;
  }
}

/**
 * Three groups of four, for example "kT7p-Qm4x-W9hd": about 70 bits of
 * randomness, easy to read out, and always letters plus digits so it passes
 * the password rules.
 */
export function generatePassword() {
  for (;;) {
    const chars = Array.from({ length: 12 }, () => ALPHABET[randomIndex(ALPHABET.length)]!);
    const value = chars.join("");
    if (/[a-zA-Z]/.test(value) && /\d/.test(value)) return `${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8)}`;
  }
}

/**
 * Password field with show and hide. With `generate`, it also offers a strong
 * random password and a copy button, so the administrator can hand it over.
 */
export function PasswordInput({
  name,
  label,
  hint,
  required = true,
  generate = false,
  autoComplete = "new-password",
}: {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  generate?: boolean;
  autoComplete?: string;
}) {
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const [generated, setGenerated] = useState(false);

  function fill() {
    setValue(generatePassword());
    setVisible(true);
    setGenerated(true);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Password copied.");
    } catch {
      toast.error("Could not copy. Select the password and copy it by hand.");
    }
  }

  return (
    <Field label={label} name={name} hint={hint} required={required}>
      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        <div className="relative min-w-0 flex-1 basis-40">
          <Input
            name={name}
            type={visible ? "text" : "password"}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setGenerated(false);
            }}
            autoComplete={autoComplete}
            spellCheck={false}
            autoCapitalize="off"
            maxLength={128}
            className={visible ? "pr-11 font-mono tracking-wide" : "pr-11"}
          />
          <button
            type="button"
            onClick={() => setVisible((shown) => !shown)}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-slate hover:text-navy"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
          >
            {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        </div>
        {generate && (
          <Button variant="secondary" onClick={fill} className="h-auto self-stretch">
            <WandSparkles aria-hidden="true" />
            Generate
          </Button>
        )}
      </div>
      {generate && generated && value && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue/20 bg-blue-tint px-3 py-2 text-[0.8125rem] text-navy">
          <span>Note this password now. It is not shown again once saved.</span>
          <Button variant="ghost" size="sm" onClick={copy}>
            <Copy aria-hidden="true" />
            Copy
          </Button>
        </div>
      )}
    </Field>
  );
}
