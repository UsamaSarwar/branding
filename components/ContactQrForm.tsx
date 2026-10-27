"use client";

import type { ContactInfo, LabeledLink, LabeledValue } from "@/lib/types";
import type { ReactNode } from "react";

type Props = {
  contact: ContactInfo;
  onChange: (contact: ContactInfo) => void;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full min-w-0 rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-neutral-500 sm:py-1.5";

const rowClass = "flex min-w-0 items-center gap-2";
const labelInputClass = `${inputClass} w-20 shrink-0 sm:w-24`;

export default function ContactQrForm({ contact, onChange }: Props) {
  function patch(partial: Partial<ContactInfo>) {
    onChange({ ...contact, ...partial });
  }

  function updateList<T extends LabeledValue | LabeledLink>(
    key: "phones" | "emails" | "socials" | "customLinks",
    index: number,
    next: T,
  ) {
    const list = [...contact[key]] as T[];
    list[index] = next;
    patch({ [key]: list } as Partial<ContactInfo>);
  }

  function addItem(key: "phones" | "emails" | "socials" | "customLinks") {
    if (key === "phones") {
      patch({ phones: [...contact.phones, { label: "work", value: "" }] });
    } else if (key === "emails") {
      patch({ emails: [...contact.emails, { label: "personal", value: "" }] });
    } else if (key === "socials") {
      patch({ socials: [...contact.socials, { label: "", url: "" }] });
    } else {
      patch({ customLinks: [...contact.customLinks, { label: "", url: "" }] });
    }
  }

  function removeItem(
    key: "phones" | "emails" | "socials" | "customLinks",
    index: number,
  ) {
    const list = contact[key].filter((_, i) => i !== index);
    patch({ [key]: list.length ? list : contact[key].slice(0, 1) } as Partial<ContactInfo>);
  }

  return (
    <div className="space-y-4">
      <Field label="Full name">
        <input
          className={inputClass}
          value={contact.fullName}
          onChange={(e) => patch({ fullName: e.target.value })}
          placeholder="Jane Doe"
        />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-2">
        <Field label="Organization">
          <input
            className={inputClass}
            value={contact.organization}
            onChange={(e) => patch({ organization: e.target.value })}
            placeholder="Acme"
          />
        </Field>
        <Field label="Title">
          <input
            className={inputClass}
            value={contact.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="Founder"
          />
        </Field>
      </div>
      <Field label="Tagline">
        <input
          className={inputClass}
          value={contact.tagline}
          onChange={(e) => patch({ tagline: e.target.value })}
          placeholder="Short headline under your name"
        />
      </Field>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
            Phones
          </span>
          <button
            type="button"
            onClick={() => addItem("phones")}
            className="text-[11px] text-neutral-400 hover:text-neutral-200"
          >
            + Add
          </button>
        </div>
        {contact.phones.map((phone, i) => (
          <div key={`phone-${i}`} className={rowClass}>
            <input
              className={labelInputClass}
              value={phone.label}
              onChange={(e) =>
                updateList("phones", i, { ...phone, label: e.target.value })
              }
              placeholder="label"
            />
            <input
              className={inputClass}
              value={phone.value}
              onChange={(e) =>
                updateList("phones", i, { ...phone, value: e.target.value })
              }
              placeholder="+1 555 000 0000"
            />
            <button
              type="button"
              onClick={() => removeItem("phones", i)}
              className="shrink-0 px-1 text-neutral-600 hover:text-neutral-300"
              aria-label="Remove phone"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
            Emails
          </span>
          <button
            type="button"
            onClick={() => addItem("emails")}
            className="text-[11px] text-neutral-400 hover:text-neutral-200"
          >
            + Add
          </button>
        </div>
        {contact.emails.map((email, i) => (
          <div key={`email-${i}`} className={rowClass}>
            <input
              className={labelInputClass}
              value={email.label}
              onChange={(e) =>
                updateList("emails", i, { ...email, label: e.target.value })
              }
              placeholder="label"
            />
            <input
              className={inputClass}
              value={email.value}
              onChange={(e) =>
                updateList("emails", i, { ...email, value: e.target.value })
              }
              placeholder="you@domain.com"
            />
            <button
              type="button"
              onClick={() => removeItem("emails", i)}
              className="shrink-0 px-1 text-neutral-600 hover:text-neutral-300"
              aria-label="Remove email"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <Field label="Website">
        <input
          className={inputClass}
          value={contact.website}
          onChange={(e) => patch({ website: e.target.value })}
          placeholder="https://"
        />
      </Field>
      <Field label="Address">
        <input
          className={inputClass}
          value={contact.address}
          onChange={(e) => patch({ address: e.target.value })}
          placeholder="City, Country"
        />
      </Field>
      <Field label="Note">
        <textarea
          className={`${inputClass} min-h-[64px] resize-y`}
          value={contact.note}
          onChange={(e) => patch({ note: e.target.value })}
          placeholder="Short bio or CTA"
        />
      </Field>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
            Social links
          </span>
          <button
            type="button"
            onClick={() => addItem("socials")}
            className="text-[11px] text-neutral-400 hover:text-neutral-200"
          >
            + Add
          </button>
        </div>
        {contact.socials.map((social, i) => (
          <div key={`social-${i}`} className={rowClass}>
            <input
              className={labelInputClass}
              value={social.label}
              onChange={(e) =>
                updateList("socials", i, { ...social, label: e.target.value })
              }
              placeholder="Label"
            />
            <input
              className={inputClass}
              value={social.url}
              onChange={(e) =>
                updateList("socials", i, { ...social, url: e.target.value })
              }
              placeholder="https://"
            />
            <button
              type="button"
              onClick={() => removeItem("socials", i)}
              className="shrink-0 px-1 text-neutral-600 hover:text-neutral-300"
              aria-label="Remove social"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
            Custom links
          </span>
          <button
            type="button"
            onClick={() => addItem("customLinks")}
            className="text-[11px] text-neutral-400 hover:text-neutral-200"
          >
            + Add
          </button>
        </div>
        {contact.customLinks.map((link, i) => (
          <div key={`custom-${i}`} className={rowClass}>
            <input
              className={labelInputClass}
              value={link.label}
              onChange={(e) =>
                updateList("customLinks", i, { ...link, label: e.target.value })
              }
              placeholder="Label"
            />
            <input
              className={inputClass}
              value={link.url}
              onChange={(e) =>
                updateList("customLinks", i, { ...link, url: e.target.value })
              }
              placeholder="https://"
            />
            <button
              type="button"
              onClick={() => removeItem("customLinks", i)}
              className="shrink-0 px-1 text-neutral-600 hover:text-neutral-300"
              aria-label="Remove link"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
