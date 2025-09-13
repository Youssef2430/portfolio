Blog Assets (public/blog)

Purpose
- This folder holds public, static assets used by the blog (cover images, inline images, diagrams, etc.).
- Files here are served at /blog/<filename>.

How to use
- Place images in this directory (or subfolders).
- Reference them in code via the public path, for example:
  - Cover image: /blog/next14-perf.png
  - Inline image: /blog/chess-llm.png

Suggested structure (optional)
- /blog/covers/...       -> Post cover images
- /blog/inline/...       -> Inline illustrations/screenshots
- /blog/diagrams/...     -> Architecture/flow diagrams

Naming conventions
- Use lowercase, hyphen-separated names.
- Include dimensions when helpful:
  - chess-llm-cover-1600x900.webp
  - rust-actix-diagram-1200w.png
- To avoid stale browser caches, change filenames when updating (e.g., append -v2 or the date).

Recommended formats and sizes
- Prefer modern formats: AVIF or WebP (with PNG/JPEG fallback only if needed).
- Covers: 1600x900 (16:9) or similar wide ratio.
- Inline images: max ~1200px width.
- Keep file sizes lean (ideally < 300KB for covers, much smaller for inline).

Optimization
- Use an optimizer before committing:
  - Squoosh (GUI) or sharp/imagemin (CLI)
  - Example (sharp CLI):
    sharp input.png --resize 1600 --webp effort=6 -o output.webp
- Remove metadata when possible to reduce size.

Accessibility
- Always provide meaningful alt text wherever images are used.

Licensing
- Only add assets you created or have rights to use.
- Include attribution in the post if required by the license.

Notes
- Public assets are immutable by URL. When you update an image, change the filename to ensure clients fetch the new version.
- Do not store sensitive information here—everything in /public is served as-is.
