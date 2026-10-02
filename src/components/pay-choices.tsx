"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Lang } from "@/lib/lang";

type Method = "apple" | "card" | "paypal";

const payCopy = {
  en: {
    how: "How to pay",
    apple: "Apple Pay",
    card: "Card",
    paypal: "PayPal",
    number: "Card number",
    exp: "Expiry",
    cvc: "CVC",
    check: "Check the card number, date, and CVC.",
    note: "Demo checkout. Uses your sandbox balance. The card number stays on this screen.",
    withApple: "Pay with Apple Pay",
    withCard: "Pay with card",
    withPaypal: "Pay with PayPal",
  },
  es: {
    how: "Cómo pagar",
    apple: "Apple Pay",
    card: "Tarjeta",
    paypal: "PayPal",
    number: "Número de tarjeta",
    exp: "Vence",
    cvc: "CVC",
    check: "Revisa el número, la fecha y el CVC.",
    note: "Pago de prueba. Usa tu saldo sandbox. El número de tarjeta se queda en esta pantalla.",
    withApple: "Pagar con Apple Pay",
    withCard: "Pagar con tarjeta",
    withPaypal: "Pagar con PayPal",
  },
} as const;

export function PayChoices({ label, lang = "en" }: { label?: string; lang?: Lang }) {
  const t = payCopy[lang];
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
      setError(t.check);
      return;
    }
    setError("");
  }

  const caption = label
    ? method === "apple"
      ? `${label} · ${t.apple}`
      : method === "paypal"
        ? `${label} · ${t.paypal}`
        : `${label} · ${t.card}`
    : method === "apple"
      ? t.withApple
      : method === "paypal"
        ? t.withPaypal
        : t.withCard;

  return (
    <div className="pay-choices">
      <input type="hidden" name="method" value={method} />
      <div className="pay-methods" role="radiogroup" aria-label={t.how}>
        <button type="button" className={`apple${method === "apple" ? " on" : ""}`} onClick={() => setMethod("apple")}>{t.apple}</button>
        <button type="button" className={`card${method === "card" ? " on" : ""}`} onClick={() => setMethod("card")}>{t.card}</button>
        <button type="button" className={`paypal${method === "paypal" ? " on" : ""}`} onClick={() => setMethod("paypal")}>{t.paypal}</button>
      </div>
      {method === "card" ? (
        <div className="card-fields">
          <input data-cc="number" inputMode="numeric" autoComplete="cc-number" placeholder={t.number} aria-label={t.number} maxLength={19} />
          <input data-cc="exp" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" aria-label={t.exp} maxLength={5} />
          <input data-cc="cvc" inputMode="numeric" autoComplete="cc-csc" placeholder="CVC" aria-label={t.cvc} maxLength={4} />
        </div>
      ) : null}
      {error ? <p className="pay-note">{error}</p> : <p className="pay-note">{t.note}</p>}
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
  lang = "en",
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden?: { name: string; value: string }[];
  title: string;
  amount: string;
  trigger: string;
  children?: ReactNode;
  lang?: Lang;
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
              <button className="pay-scrim" type="button" aria-label={lang === "es" ? "Cerrar pago" : "Close payment"} onClick={() => setOpen(false)} />
              <form action={action} className="pay-panel">
                {hidden.map((field) => <input key={field.name} type="hidden" name={field.name} value={field.value} />)}
                <div className="pay-panel-head">
                  <strong>{title}</strong>
                  <b>{amount}</b>
                </div>
                {children}
                <PayChoices lang={lang} />
              </form>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
