# Fitness App Frontend

## Local Development
### Environment
Copy `.env.template` to `.env` in the project root:

```bash
  cp .env.template .env
```

* Edit `.env` to provide your local development values.
* The `.env` file is excluded from version control (via `.gitignore`) to keep sensitive data safe.

### Running the Expo Project
#### Install dependencies
```bash
  npm install
```
or if you use yarn:
```bash
  yarn install
```
#### Start the Expo development server
```bash
  npx expo start
```
#### Open the app
On your phone:
- Install the Expo Go app from the App Store or Google Play.
- Scan the QR code shown in your terminal or browser after running expo start.

On an emulator/simulator:
- Press a to open Android Emulator.
- Press i to open iOS Simulator (Mac only).
- Or open manually from Expo Dev Tools in the browser.