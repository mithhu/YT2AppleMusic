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

---

## Daily Cron Job (Database Seeding)

The website includes a daily cron job that automatically grows the community database by mapping Apple Music's top 100 songs to YouTube videos.

### How it works

1. Runs daily at 6:00 AM UTC via Vercel Cron
2. Fetches Apple Music top 100 songs (free RSS feed, no API key)
3. For each song not already in the DB, searches YouTube for the video
4. Saves the YouTube ID to Apple Music ID mapping in Supabase

### Setup (one-time)

1. Go to your Vercel project **Settings > Environment Variables**
2. Add a new variable:
   - **Name**: `CRON_SECRET`
   - **Value**: any random string (e.g. generate one with `openssl rand -hex 32`)
   - **Environment**: Production
3. Deploy — Vercel will pick up `vercel.json` and register the cron

### Manual trigger (for testing)

```bash
curl http://localhost:3000/api/cron/seed-db
```

Or on production:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-site.vercel.app/api/cron/seed-db
```
