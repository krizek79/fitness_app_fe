[![Backend API](https://img.shields.io/badge/Backend-API-blue)](https://github.com/krizek79/fitness_app_be)
[![Web App](https://img.shields.io/badge/Web-Live-green)](https://fitness-app-fe-0v0o.onrender.com)

# Fitness App Frontend

## Web Version

A web build is deployed and publicly accessible at:
**[https://fitness-app-fe-0v0o.onrender.com](https://fitness-app-fe-0v0o.onrender.com)**

Deployments are automated — every push to `main` that passes CI is built and deployed automatically via GitHub Actions.

## Local Development
### Environment
Copy `.env.template` to `.env` in the project root:

```bash
cp .env.template .env
```

* Edit `.env` to provide your local development values.
* The `.env` file is excluded from version control (via `.gitignore`) to keep sensitive data safe.

### Running the Expo Project

Before running locally, it's required to be a part of Expo development group.

#### Install dependencies
```bash
npm install
```
or if you use yarn:
```bash
yarn install
```
#### Login to Expo
```bash
npx expo login --sso
```

#### Start the Expo development server
```bash
npx expo start --tunnel
```
#### Open the app
On your phone:
- Install the Expo Go app from the App Store or Google Play.
- Scan the QR code shown in your terminal or browser after running expo start.

On an emulator/simulator:
- Press a to open Android Emulator.
- Press i to open iOS Simulator (Mac only).
- Or open manually from Expo Dev Tools in the browser.
