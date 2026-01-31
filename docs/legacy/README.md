Legacy assets archive
=====================

This folder tracks legacy static prototypes and historical assets that are being phased out.

- Source location retained temporarily: `karmastats-old/`
- Contents include early HTML prototypes and one large PDF booklet used during ideation.

Archival plan
- Keep `karmastats-old/` unchanged until final QA completes for the refactored tools.
- After QA, move HTML files into `docs/legacy/` and link the PDF from releases storage.
- Remove the `karmastats-old/` directory from the repository to reduce size and duplication.

Notes
- No runtime code depends on any file in `karmastats-old/`.
- If external links reference those HTML files, create redirects in Next.js or via hosting config.

