export type ThemeMode = "dark" | "light";

export type LabeledValue = {
  label: string;
  value: string;
};

export type LabeledLink = {
  label: string;
  url: string;
};

export type ContactInfo = {
  fullName: string;
  organization: string;
  title: string;
  /** Short headline shown under the name in profile mockups */
  tagline: string;
  phones: LabeledValue[];
  emails: LabeledValue[];
  website: string;
  address: string;
  note: string;
  socials: LabeledLink[];
  customLinks: LabeledLink[];
};

export type BrandData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  theme: ThemeMode;
  /** Cropped 1:1 DP used in mockups / export */
  dpPath: string | null;
  /** Original upload used for reframing */
  dpOriginalPath: string | null;
  contact: ContactInfo;
  updatedAt: string;
};

export const defaultContact = (): ContactInfo => ({
  fullName: "",
  organization: "",
  title: "",
  tagline: "",
  phones: [{ label: "mobile", value: "" }],
  emails: [{ label: "work", value: "" }],
  website: "",
  address: "",
  note: "",
  socials: [
    { label: "LinkedIn", url: "" },
    { label: "X", url: "" },
  ],
  customLinks: [{ label: "", url: "" }],
});

export const defaultBrandData = (): BrandData => ({
  eyebrow: "Personal Brand",
  title: "Your Name",
  subtitle: "Designer · Builder · Operator",
  theme: "dark",
  dpPath: null,
  dpOriginalPath: null,
  contact: defaultContact(),
  updatedAt: "",
});
