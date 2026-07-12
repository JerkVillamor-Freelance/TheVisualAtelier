# The Visual Atelier

Production-ready static portfolio for **Jerk T. Villamor**, designed for direct publication through GitHub Pages.

## Project structure

```text
.
├── index.html
├── styles.css
├── script.js
├── asset-manifest.js
├── favicon.svg
├── README.md
├── .gitignore
├── .nojekyll
└── assets/
    └── images/
```

## Preview locally

No build step is required.

1. Open `index.html` directly in a browser, or
2. Run a small local server from the repository root:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a GitHub repository.
2. Upload every file and folder from this project to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the default branch, usually `main`, and choose `/(root)`.
6. Save and wait for GitHub Pages to publish the site.

All asset paths are relative, so the site works under a project path such as `username.github.io/repository-name/`.

## Image and asset management

- The site contains 239 mapped portfolio image placements.
- Every file in `assets/images/` uses a collision-safe name that begins with its internal asset identifier.
- Source image bytes were preserved exactly. File extensions were normalized to match the actual JPEG encoding of the uploaded files; no image was re-encoded.
- `asset-manifest.js` records each local source path, category, role, dimensions, and SHA-256 hash.
- Repeated original filenames remain separate because their collision-safe names are unique.

To replace an image later:

1. Replace the matching file in `assets/images/` while retaining its path, or update the path in `index.html`.
2. Preserve the intended aspect ratio and category placement.
3. Update `asset-manifest.js` if the file path, dimensions, or role changes.

## Accessibility

The website includes:

- semantic landmarks and heading hierarchy;
- a skip link;
- persistent keyboard-accessible navigation;
- visible focus styles;
- descriptive image alternatives;
- keyboard and touch-compatible comparison controls;
- an accessible native-dialog lightbox;
- focus restoration after closing the lightbox;
- reduced-motion support.

## Browser support

Designed for current versions of Chrome, Edge, Firefox, and Safari. The site uses the native `<dialog>` element and modern CSS. Current evergreen browsers support these features.

## Known limitations

- Editorial web fonts are loaded from Google Fonts. Strong system fallbacks preserve usability if they are unavailable.
- The repository is intentionally image-heavy. Images below the fold use lazy loading, but the full project download remains substantial because all original portfolio assets are included.
