"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Method = "apple" | "card" | "paypal";

export function PayChoices({ label }: { label?: string }) {
  const [method, setMethod] = useState<Method>("apple");
  const [error, setError] = useState("");

  function onPay(event: MouseEvent<HTMLButtonElement>) {
    if (method !== "card") return;
    const form = event.currentTarget.form;
    if (!form) return;
    const number = valueOf(form, "number").replace(/\s/g, "");
    const exp = valueOf(form, "exp");
    const cvc = valueOf(form, "cvc");
    if (number.length < 12 || exp.length < 4 || cvc.length < 3) {
      event.preventDefault();
      setError("Check the card number, date, and CVC.");
      return;
    }
    setError("");
  }

  const caption = label
    ? method === "apple"
      ? `${label} · Apple Pay`
      : method === "paypal"
        ? `${label} · PayPal`
        : `${label} · Card`
    : method === "apple"
      ? "Pay with Apple Pay"
      : method === "paypal"
        ? "Pay with PayPal"
        : "Pay with card";

  return (
    <div className="pay-choices">
      <input type="hidden" name="method" value={method} />
      <div className="pay-methods" role="radiogroup" aria-label="How to pay">
        <button type="button" className={`apple${method === "apple" ? " on" : ""}`} onClick={() => setMethod("apple")}>Apple Pay</button>
        <button type="button" className={`card${method === "card" ? " on" : ""}`} onClick={() => setMethod("card")}>Card</button>
        <button type="button" className={`paypal${method === "paypal" ? " on" : ""}`} onClick={() => setMethod("paypal")}>PayPal</button>
      </div>
      {method === "card" ? (
        <div className="card-fields">
          <input data-cc="number" inputMode="numeric" autoComplete="cc-number" placeholder="Card number" aria-label="Card number" maxLength={19} />
          <input data-cc="exp" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" aria-label="Expiry" maxLength={5} />
          <input data-cc="cvc" inputMode="numeric" autoComplete="cc-csc" placeholder="CVC" aria-label="CVC" maxLength={4} />
        </div>
      ) : null}
      {error ? <p className="pay-note">{error}</p> : <p className="pay-note">Demo checkout. Uses your sandbox balance. The card number stays on this screen.</p>}
      <button className={`pay-go ${method}`} type="submit" onClick={onPay}>{caption}</button>
    </div>
  );
}

function valueOf(form: HTMLFormElement, key: string) {
  return (form.querySelector(`[data-cc=${key}]`) as HTMLInputElement | null)?.value ?? "";
}

export function PaySheet({
  action,
  hidden = [],
  title,
  amount,
  trigger,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden?: { name: string; value: string }[];
  title: string;
  amount: string;
  trigger: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <>
      <button className="red-btn" type="button" onClick={() => setOpen(true)}>{trigger}</button>
      {open && mounted
        ? createPortal(
            <div className="pay-sheet" role="dialog" aria-modal="true" aria-label={title}>
              <button className="pay-scrim" type="button" aria-label="Close payment" onClick={() => setOpen(false)} />
              <form action={action} className="pay-panel">
                {hidden.map((field) => <input key={field.name} type="hidden" name={field.name} value={field.value} />)}
                <div className="pay-panel-head">
                  <strong>{title}</strong>
                  <b>{amount}</b>
                </div>
                {children}
                <PayChoices />
              </form>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
