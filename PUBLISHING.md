# Running GolfHaus on your phone

## Preview in Expo Go, with your Mac OFF (recommended)

Publishes the JS bundle to Expo's servers so Expo Go loads it from anywhere —
no dev server, no Mac required after publishing.

One-time setup (needs your free Expo account):

```bash
npx eas-cli login
npx eas-cli init      # assigns a project id, writes it into app.json
```

Then, any time you want to push the current code:

```bash
npm run publish       # = npx eas-cli update --auto
```

`eas update` prints a QR code. On iPhone, open the **Camera app** and scan it —
iOS offers "Open in Expo Go". (Install Expo Go from the App Store first.)
Re-run `npm run publish` whenever you change the app; reopen it in Expo Go to
get the new version. Works with the Mac shut.

### Live Coach (optional)
Without a key the Coach runs in scripted "Demo" mode. To use the real Claude API:

```bash
cp .env.example .env
# edit .env and set EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...
npm run publish
```

The key is read at publish time and inlined into the bundle. Note: `EXPO_PUBLIC_`
vars are extractable from the shipped bundle — fine for personal testing, but for
a public release move the key behind a small proxy.

## A real installed app (no Expo Go)

Standalone binaries that run fully offline, no Mac.

- **Android APK** (free, no store): `npm run build:android` → download the link on
  your phone and install (allow "install from unknown sources").
- **iOS / TestFlight** (needs a paid Apple Developer account, $99/yr):
  `npm run build:ios` then `npx eas-cli submit -p ios` → install via TestFlight.

Both use the `preview` profile in `eas.json`. Add the Coach key as a build secret
so it's in the binary:

```bash
npx eas-cli secret:create --name EXPO_PUBLIC_ANTHROPIC_API_KEY --value sk-ant-...
```

## Quick local preview (Mac stays on)

```bash
npm run tunnel        # = expo start --tunnel; scan the QR with the iOS Camera
```
Works from anywhere while the Mac is awake and online; dies when it sleeps.
