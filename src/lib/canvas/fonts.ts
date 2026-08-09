export async function waitForFonts(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) {
    return;
  }

  try {
    // Wait for document fonts to finish loading
    await document.fonts.ready;
  } catch (err) {
    console.warn("Font loading wait fallback:", err);
  }
}
