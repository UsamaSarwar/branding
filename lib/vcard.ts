import type { ContactInfo } from "./types";

function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function splitName(fullName: string): { family: string; given: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { family: "", given: "" };
  if (parts.length === 1) return { family: parts[0], given: "" };
  return { family: parts[parts.length - 1], given: parts.slice(0, -1).join(" ") };
}

/** Build a vCard 3.0 payload for QR encoding */
export function buildVCard(contact: ContactInfo): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];
  const { family, given } = splitName(contact.fullName);

  if (contact.fullName.trim()) {
    lines.push(`FN:${escapeVCard(contact.fullName.trim())}`);
    lines.push(`N:${escapeVCard(family)};${escapeVCard(given)};;;`);
  }

  if (contact.organization.trim()) {
    lines.push(`ORG:${escapeVCard(contact.organization.trim())}`);
  }
  if (contact.title.trim()) {
    lines.push(`TITLE:${escapeVCard(contact.title.trim())}`);
  }

  for (const phone of contact.phones) {
    if (!phone.value.trim()) continue;
    const type = phone.label.trim() || "VOICE";
    lines.push(`TEL;TYPE=${escapeVCard(type)}:${escapeVCard(phone.value.trim())}`);
  }

  for (const email of contact.emails) {
    if (!email.value.trim()) continue;
    const type = email.label.trim() || "INTERNET";
    lines.push(`EMAIL;TYPE=${escapeVCard(type)}:${escapeVCard(email.value.trim())}`);
  }

  if (contact.website.trim()) {
    lines.push(`URL:${escapeVCard(contact.website.trim())}`);
  }

  if (contact.address.trim()) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCard(contact.address.trim())};;;;`);
  }

  const noteParts = [contact.tagline.trim(), contact.note.trim()].filter(
    Boolean,
  );
  if (noteParts.length) {
    lines.push(`NOTE:${escapeVCard(noteParts.join(" — "))}`);
  }

  for (const social of contact.socials) {
    if (!social.url.trim()) continue;
    const label = social.label.trim() || "SOCIAL";
    lines.push(
      `X-SOCIALPROFILE;TYPE=${escapeVCard(label)}:${escapeVCard(social.url.trim())}`,
    );
    lines.push(`URL:${escapeVCard(social.url.trim())}`);
  }

  for (const link of contact.customLinks) {
    if (!link.url.trim()) continue;
    lines.push(`URL:${escapeVCard(link.url.trim())}`);
    if (link.label.trim()) {
      lines.push(`NOTE:${escapeVCard(`${link.label.trim()}: ${link.url.trim()}`)}`);
    }
  }

  lines.push("END:VCARD");
  return lines.join("\n");
}

export function hasContactContent(contact: ContactInfo): boolean {
  return Boolean(
    contact.fullName.trim() ||
      contact.organization.trim() ||
      contact.title.trim() ||
      contact.tagline.trim() ||
      contact.website.trim() ||
      contact.address.trim() ||
      contact.note.trim() ||
      contact.phones.some((p) => p.value.trim()) ||
      contact.emails.some((e) => e.value.trim()) ||
      contact.socials.some((s) => s.url.trim()) ||
      contact.customLinks.some((c) => c.url.trim()),
  );
}
