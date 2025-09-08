// DownloadApp.jsx
import React from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectTheme } from "../../redux/features/themeSlice";
import { selectTranslate } from "../../redux/features/translateSlice";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";

import bgImage from "../../assets/images/DownloadApp/Img1.png";

const DownloadApp = () => {
  const theme = useSelector(selectTheme);
  const lang = useSelector(selectTranslate);
  const { t } = useTranslation();

  const androidUrl = "https://drive.google.com/file/d/14NpjYMaUKfSd8g4VxtSz0iAd5QAGG8Ec/view?usp=drivesdk";

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="flex items-center justify-center h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative flex flex-col items-center space-y-6 p-8 rounded-2xl max-w-md w-full
          bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl text-white"
      >
        <h1 className="text-3xl font-bold text-center drop-shadow-md">
          {t("Download our mobile app")}
        </h1>
        <div className="bg-white/80 p-4 rounded-xl shadow-lg">
          <QRCode value={androidUrl} size={180} />
        </div>

        <p className="text-center text-sm text-gray-200 drop-shadow-sm">
          {t("Scan this QR code with your phone to download the app")}
        </p>
      </motion.div>
    </div>
  );
};
export default DownloadApp;
