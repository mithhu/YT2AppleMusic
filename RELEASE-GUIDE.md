# Release Guide — YT2AppleMusic Chrome Extension

## How to Create a New Release

### 1. Build the extension

```bash
npm run build
```

### 2. Zip the dist folder

```bash
zip -r YT2AppleMusic-vX.Y.Z.zip dist/
```

Replace `X.Y.Z` with the new version number (e.g. `v2.1.0`).

### 3. Create the GitHub Release

```bash
gh release create vX.Y.Z YT2AppleMusic-vX.Y.Z.zip --title "YT2AppleMusic vX.Y.Z" --notes "What changed in this version"
```

The website's "Get Extension" link points to `/releases/latest`, so it will always auto-point to the newest release.

---

## Version Numbering

- Version numbers must be **unique** — you can't reuse a version that already exists.
- Follow semantic versioning: `vMAJOR.MINOR.PATCH`
  - **PATCH** (v2.0.1): bug fixes, small tweaks
  - **MINOR** (v2.1.0): new features, non-breaking changes
  - **MAJOR** (v3.0.0): breaking changes, major rewrites

## Useful Commands

| Command | Description |
|---------|-------------|
| `gh release list` | See all existing releases |
| `gh release view vX.Y.Z` | View details of a specific release |
| `gh release delete vX.Y.Z` | Delete a release (if you need to redo it) |
| `gh release create vX.Y.Z file.zip --title "Title" --notes "Notes"` | Create a new release |

---

## How to Create a Release from the GitHub Website

### 1. Build and zip locally

```bash
npm run build
zip -r YT2AppleMusic-vX.Y.Z.zip dist/
```

### 2. Go to the Releases page

Open: **https://github.com/mithhu/YT2AppleMusic/releases**

### 3. Click "Draft a new release"

- Click the **"Draft a new release"** button (top right).

### 4. Fill in the details

- **Choose a tag**: Type the new version (e.g. `v2.1.0`) and click "Create new tag on publish".
- **Release title**: `YT2AppleMusic v2.1.0`
- **Description**: Write what changed in this version.
- **Attach the zip**: Drag and drop `YT2AppleMusic-vX.Y.Z.zip` into the "Attach binaries" area at the bottom of the description box.

### 5. Publish

- Click **"Publish release"**.

Done — the website's "Get Extension" link auto-points to the latest release.

---

## Notes

- The `*.zip` rule in `.gitignore` ensures zip files never get committed to the repo.
- Always build fresh (`npm run build`) before zipping to make sure the dist folder is up to date.
- If you need to fix a release, delete it first with `gh release delete`, then recreate it.
- You can also edit an existing release on the GitHub website by going to the release page and clicking the pencil (edit) icon.
