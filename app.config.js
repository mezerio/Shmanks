import "dotenv/config";

export default {
  expo: {
    name: "shmanks",
    slug: "shmanks",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/shmanksIcon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/shmanksIcon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      package: "com.mezerio.shmanks",
      adaptiveIcon: {
        foregroundImage: "./assets/shmanksIcon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      favicon: "./assets/shmanksIcon.png",
    },
    extra: {
      eas: {
        projectId: "0be2c7e6-3ba4-4f96-9bb1-92151098a0b5",
      },
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      databaseURL: process.env.DATABASE_URL,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      measurementId: process.env.MEASUREMENT_ID,
    },
  },
};
