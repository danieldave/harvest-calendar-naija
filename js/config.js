/* ==========================================================================
   HARVEST CALENDAR NAIJA – js/config.js  (switches for new features)
   --------------------------------------------------------------------------
   photos: the Farm Doctor photo upload is FULLY BUILT but locked.
           To switch it on later:
             1. set photos: true here, and
             2. add DOCTOR_PHOTOS=on in Vercel > Settings > Environment Variables.
           Both are needed, so nobody can switch it on by accident.
   NEVER put an API key in this file: anyone can read website files.
   ========================================================================== */
window.HCN_CONFIG = {
  photos: false,
  weatherEndpoint: "/api/weather",
  doctorEndpoint: "/api/doctor",
  photoMaxSide: 1024      // photos are shrunk to this size before sending (saves data and money)
};
