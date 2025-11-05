import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD-ze8S1FyrqulSIw9P-LClZpIiqCWszIY",
  authDomain: "app-react-native-2025.firebaseapp.com",
  projectId: "app-react-native-2025",
  storageBucket: "app-react-native-2025.firebasestorage.app",
  messagingSenderId: "1086621941454",
  appId: "1:1086621941454:web:56deb5fc32910895b09a9f",
  measurementId: "G-2K3SC2NZTB"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);