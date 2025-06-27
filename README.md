# FallGuard

FallGuard is a React Native application designed to help elderly patients and their caretakers manage fall risk, log incidents, and access educational resources. The app provides screening tools, patient information, fall logs, and a dashboard for caretakers.

## Features

- **Patient & Caretaker Accounts:** Sign up as a patient or caretaker.
- **Screening:** NIH STEADI-3 fall risk questionnaire for patients.
- **Patient Info:** Educational resources about falls and exercise.
- **Fall Log:** Patients can log fall incidents.
- **Caretaker Dashboard:** Caretakers can manage and monitor linked patients.
- **Referral Codes:** Patients can link to caretakers using referral codes.
- **Tai-Chi Events Map:** View a map of current Tai-Chi events in Northern Indiana.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/getachewjoseph/parkview_challenge.git
   cd parkview_challenge
   ```

2. Install dependencies:
   ```sh
   yarn install
   # or
   npm install
   ```

   Also install the map library:
   ```sh
   npx expo install react-native-maps
   ```

3. Start the Expo development server:
   ```sh
   yarn start
   # or
   npm start
   ```

4. Run the app on your device or emulator using the Expo Go app.

## Project Structure

- `app/` - Main application screens and navigation.
- `components/` - Reusable UI components.
- `contexts/` - React context providers (e.g., authentication).
- `lib/` - API utilities and helpers.
- `assets/` - Fonts and images.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Future Plans

### Deployment

- **App Store & Google Play:** Prepare and submit the app for release on both iOS and Android platforms.
- **Backend Hosting:** Deploy the backend API and database to a scalable cloud provider.
- **Continuous Integration:** Set up CI/CD pipelines for automated testing and deployment.

### Upcoming Features

- **Advanced Fall Risk Screening:** Integrate additional validated screening tools and periodic reminders.
- **Personalized Fall Prevention Plans:** Generate tailored exercise and prevention plans based on screening results.
- **Progress Tracking:** Visualize patient progress and adherence to prevention plans.
- **Notifications:** Push notifications for medication reminders, exercise, and screening.
- **Caretaker-Patient Communication:** Secure messaging between patients and caretakers.
- **Resource Library:** Expand educational content with videos, articles, and local resources.
- **Analytics Dashboard:** For caretakers to monitor trends and receive alerts for high-risk patients.
- **Localization:** Support for multiple languages.

## License

[MIT](LICENSE)
