/**
 * Regal Frost typography — loaded via @fontsource in globals.css (no Google fetch at build).
 * Keeps the same exports used by shells and legacy imports.
 */
type FontExport = {
  variable: string;
  className: string;
};

export const luxuryDisplay: FontExport = {
  variable: "",
  className: "font-luxury-display",
};

export const luxurySection: FontExport = {
  variable: "",
  className: "font-luxury-section",
};

export const glassBody: FontExport = {
  variable: "",
  className: "font-glass-body",
};

/** Applied on regal-frost / workspace shells */
export const glassFontVariables = [
  glassBody.className,
  luxuryDisplay.className,
  luxurySection.className,
].join(" ");
