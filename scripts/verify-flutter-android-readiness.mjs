// Compatibility entrypoint used by the preview build command.
import { verifyAndroidApi21FirebaseFiles } from './verify-android-api21-firebase.mjs';

const result = verifyAndroidApi21FirebaseFiles();
if (!result.ok) {
  for (const error of result.errors) console.error('ERROR: ' + error);
  process.exitCode = 1;
} else {
  console.log('Flutter Android readiness contract passed (Firebase pins and minSdk 21).');
}
