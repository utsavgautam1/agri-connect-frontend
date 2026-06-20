/**
 * i18n.js — Global Language System (Redux-backed)
 * Place at: src/utils/i18n.js
 *
 * Usage in ANY screen:
 *   import { useTranslation } from '../../utils/i18n';
 *   const { t, language, setLanguage } = useTranslation();
 */
import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage as setLang, selectLanguage } from '../store/slices/appSlice';

const en = {
  common: { save:'Save', cancel:'Cancel', confirm:'Confirm', retry:'Try Again', loading:'Loading…', error:'Something went wrong.', noData:'No data available.', today:'Today', updated:'Updated', clear:'Clear', done:'Done' },
  nav: { home:'Home', market:'Market', weather:'Weather', disease:'Disease', settings:'Settings' },
  home: { greetingMorning:'Good Morning', greetingAfternoon:'Good Afternoon', greetingEvening:'Good Evening', defaultName:'Farmer', offlineTitle:"You're offline", offlineMessage:'Showing cached data. Some features may be unavailable.', weatherTitle:"Today's Weather", quickActions:'Quick Actions', exploreTopics:'Explore Topics', tipTitle:'Tip of the Day', tipCTA:'Tap to read more →' },
  weather: { title:'Weather', lastUpdated:'Last updated at', unavailable:'Weather Unavailable', updating:'Updating weather…', fetching:'Fetching your local weather…', farmingTip:'Farming Advisory', windDirection:'Wind Direction', humidity:'Humidity', visibility:'Visibility', pressure:'Pressure hPa', sunrise:'Sunrise', sunset:'Sunset', forecast:'5-Day Forecast', feelsLike:'Feels like', tryAgain:'Try Again' },
  market: { title:'Market Prices', search:'Search crops or markets...', crops:'crops', mostRecent:'Most Recent', nameAZ:'Name A-Z', priceDown:'Price ↓', biggestRise:'Biggest Rise', currentPrice:'CURRENT PRICE', perUnit:'per', priceHistory:'Tap for price history', rising:'Rising', falling:'Falling', stable:'Stable', fetching:'Fetching Kalimati market prices…' },
  advisory: { title:'Advisory', askExpert:'Ask Expert', askLabel:'Your question for our agronomists:', askPlaceholder:'Describe your crop issue or farming question…', submit:'Submit Question', noContent:'No Advisories', noContentMsg:'No content found for this category.', minRead:'min read', all:'All' },
  disease: { title:'Disease Detection', subtitle:'Take a photo of your crop to detect diseases using AI.', takePhoto:'Take Photo', uploadPhoto:'Upload from Gallery', analyzing:'Analyzing…', noDisease:'No disease detected.', result:'Detection Result' },
  sms: { title:'SMS Alerts', subtitle:'Send and manage SMS notifications for your farm', sendCustom:'Send Custom Alert', recipient:'Recipient Phone Number', message:'Message', send:'Send SMS', sending:'Sending…', subscriptions:'Auto-Alert Subscriptions', subscriptionNote:'Choose which alerts are automatically sent to your phone.', recentMessages:'Recent Messages', noMessages:'No messages sent yet.', queued:'Queued Offline', queuedMsg:'Your SMS will be sent when you reconnect.', sentSuccess:'SMS delivered successfully.', enterPhone:'Please enter a phone number.', enterMessage:'Please enter a message.' },
  settings: { title:'Settings', notifications:'Notifications', allNotifs:'All Notifications', weatherAlerts:'Weather Alerts', marketPrices:'Market Prices', advisoryUpdates:'Advisory Updates', appearance:'Appearance', darkMode:'Dark Mode', darkModeOn:'On', darkModeOff:'Off', tempUnit:'Temperature Unit', language:'Language', languageChanged:'Language Changed', languageMsg:'App language set to', dataStorage:'Data & Storage', clearCache:'Clear App Cache', clearCacheDesc:'Removes cached offline data', clearCacheTitle:'Clear Cache', clearCacheMsg:'This will remove all cached data.', clearCacheDone:'Cache cleared successfully.', about:'About', appVersion:'App Version', privacyPolicy:'Privacy Policy', termsOfUse:'Terms of Use', signOut:'Sign Out', signOutTitle:'Sign Out', signOutMsg:'Are you sure you want to sign out?' },
  auth: { login:'Sign In', register:'Create Account', email:'Email Address', password:'Password', fullName:'Full Name', phone:'Phone Number', farmLocation:'Farm Location', forgotPassword:'Forgot Password?', noAccount:"Don't have an account?", hasAccount:'Already have an account?', welcomeBack:'Welcome Back', signInSubtitle:'Sign in to your account', signUpSubtitle:'Create your free account' },
  privacy: { title:'Privacy Policy', body:'Agri-Connect Privacy Policy\nLast updated: March 2026\n\n1. Information We Collect\nWe collect your name, email, phone number, and farm location on registration.\n\n2. How We Use Your Information\nWe use your data to deliver accurate local weather forecasts, market prices, and agricultural advisory services.\n\n3. Data Sharing\nWe do not sell your personal data.\n\n4. Location Data\nWith your permission, we access GPS location to provide accurate local data.\n\n5. Data Security\nAll data is encrypted in transit and at rest.\n\n6. Contact\nprivacy@agri-connect.app' },
  terms: { title:'Terms of Use', body:'Agri-Connect Terms of Use\nLast updated: March 2026\n\n1. Acceptance\nBy using Agri-Connect, you agree to these Terms.\n\n2. Market Price Data\nPrices are informational only. We are not liable for financial decisions.\n\n3. Weather Information\nForecasts are provided by OpenWeatherMap. Always verify for critical decisions.\n\n4. Disease Detection\nAI detection is a support tool only. Consult a certified agronomist.\n\n5. Contact\nsupport@agri-connect.app' },
};

const ne = {
  common: { save:'सुरक्षित', cancel:'रद्द', confirm:'पुष्टि', retry:'पुनः प्रयास', loading:'लोड हुँदैछ…', error:'केही गलत भयो।', noData:'डेटा उपलब्ध छैन।', today:'आज', updated:'अद्यावधिक', clear:'खाली', done:'सम्पन्न' },
  nav: { home:'गृह', market:'बजार', weather:'मौसम', disease:'रोग', settings:'सेटिङ' },
  home: { greetingMorning:'शुभ बिहान', greetingAfternoon:'शुभ दिउँसो', greetingEvening:'शुभ साँझ', defaultName:'किसान', offlineTitle:'तपाईं अफलाइन हुनुहुन्छ', offlineMessage:'क्यास डेटा देखाउँदैछ।', weatherTitle:'आजको मौसम', quickActions:'द्रुत कार्यहरू', exploreTopics:'विषयहरू अन्वेषण', tipTitle:'आजको सुझाव', tipCTA:'थप पढ्न थिच्नुहोस् →' },
  weather: { title:'मौसम', lastUpdated:'अन्तिम अद्यावधिक', unavailable:'मौसम उपलब्ध छैन', updating:'मौसम अद्यावधिक हुँदैछ…', fetching:'स्थानीय मौसम खोज्दैछ…', farmingTip:'कृषि सल्लाह', windDirection:'हावाको दिशा', humidity:'आर्द्रता', visibility:'दृश्यता', pressure:'दबाब hPa', sunrise:'सूर्योदय', sunset:'सूर्यास्त', forecast:'५-दिन पूर्वानुमान', feelsLike:'महसुस', tryAgain:'पुनः प्रयास' },
  market: { title:'बजार मूल्यहरू', search:'बाली वा बजार खोज्नुहोस्...', crops:'बालीहरू', mostRecent:'सबैभन्दा नयाँ', nameAZ:'नाम A-Z', priceDown:'मूल्य ↓', biggestRise:'सबैभन्दा बढी', currentPrice:'हालको मूल्य', perUnit:'प्रति', priceHistory:'मूल्य इतिहास', rising:'बढ्दो', falling:'घट्दो', stable:'स्थिर', fetching:'कालीमाटी बजार मूल्य खोज्दैछ…' },
  advisory: { title:'सल्लाह', askExpert:'विशेषज्ञलाई सोध्नुहोस्', askLabel:'हाम्रा कृषिविद्हरूलाई प्रश्न:', askPlaceholder:'आफ्नो बालीको समस्या वर्णन गर्नुहोस्…', submit:'प्रश्न पेश', noContent:'कुनै सल्लाह छैन', noContentMsg:'यस श्रेणीमा सामग्री फेला परेन।', minRead:'मिनेट', all:'सबै' },
  disease: { title:'रोग पहिचान', subtitle:'AI प्रयोग गरेर बाली रोग पहिचान गर्न फोटो खिच्नुहोस्।', takePhoto:'फोटो खिच्नुहोस्', uploadPhoto:'ग्यालेरीबाट अपलोड', analyzing:'विश्लेषण हुँदैछ…', noDisease:'कुनै रोग फेला परेन।', result:'पहिचान परिणाम' },
  sms: { title:'SMS अलर्ट', subtitle:'खेतको SMS सूचनाहरू पठाउनुहोस्', sendCustom:'कस्टम अलर्ट पठाउनुहोस्', recipient:'प्राप्तकर्ता फोन नम्बर', message:'सन्देश', send:'SMS पठाउनुहोस्', sending:'पठाउँदैछ…', subscriptions:'स्वत: अलर्ट सदस्यता', subscriptionNote:'कुन अलर्टहरू SMS मा प्राप्त गर्ने छान्नुहोस्।', recentMessages:'हालका सन्देशहरू', noMessages:'अहिलेसम्म कुनै सन्देश पठाइएको छैन।', queued:'अफलाइन कतारमा', queuedMsg:'पुनः जडान हुँदा SMS पठाइनेछ।', sentSuccess:'SMS सफलतापूर्वक डेलिभर भयो।', enterPhone:'कृपया फोन नम्बर प्रविष्ट गर्नुहोस्।', enterMessage:'कृपया सन्देश प्रविष्ट गर्नुहोस्।' },
  settings: { title:'सेटिङ', notifications:'सूचनाहरू', allNotifs:'सबै सूचनाहरू', weatherAlerts:'मौसम अलर्ट', marketPrices:'बजार मूल्यहरू', advisoryUpdates:'सल्लाह अद्यावधिक', appearance:'रूपरेखा', darkMode:'डार्क मोड', darkModeOn:'चालू', darkModeOff:'बन्द', tempUnit:'तापक्रम एकाइ', language:'भाषा', languageChanged:'भाषा परिवर्तन भयो', languageMsg:'एप भाषा सेट', dataStorage:'डेटा र भण्डारण', clearCache:'क्यास खाली', clearCacheDesc:'अफलाइन डेटा हटाउँछ', clearCacheTitle:'क्यास खाली', clearCacheMsg:'सबै क्यास डेटा हटाइनेछ।', clearCacheDone:'क्यास सफलतापूर्वक खाली।', about:'बारेमा', appVersion:'एप संस्करण', privacyPolicy:'गोपनीयता नीति', termsOfUse:'प्रयोगका सर्तहरू', signOut:'साइन आउट', signOutTitle:'साइन आउट', signOutMsg:'के तपाईं साइन आउट गर्न निश्चित हुनुहुन्छ?' },
  auth: { login:'साइन इन', register:'खाता बनाउनुहोस्', email:'इमेल ठेगाना', password:'पासवर्ड', fullName:'पूरा नाम', phone:'फोन नम्बर', farmLocation:'खेत स्थान', forgotPassword:'पासवर्ड बिर्सनुभयो?', noAccount:'खाता छैन?', hasAccount:'पहिले नै खाता छ?', welcomeBack:'स्वागत छ', signInSubtitle:'आफ्नो खातामा साइन इन', signUpSubtitle:'नि:शुल्क खाता बनाउनुहोस्' },
  privacy: { title:'गोपनीयता नीति', body:'Agri-Connect गोपनीयता नीति\nअन्तिम अद्यावधिक: मार्च २०२६\n\n१. जानकारी सङ्कलन\nदर्ता गर्दा नाम, इमेल, फोन र खेत स्थान सङ्कलन गर्छौं।\n\n२. डेटा सुरक्षा\nसबै डेटा एन्क्रिप्टेड छ।\n\n३. सम्पर्क\nprivacy@agri-connect.app' },
  terms: { title:'प्रयोगका सर्तहरू', body:'Agri-Connect प्रयोगका सर्तहरू\nअन्तिम अद्यावधिक: मार्च २०२६\n\n१. स्वीकृति\nAgri-Connect प्रयोग गरेर, तपाईं यी सर्तहरूमा सहमत हुनुहुन्छ।\n\n२. सम्पर्क\nsupport@agri-connect.app' },
};

const translations = { en, ne };
const I18nContext = createContext({ t: (k) => k, language: 'en', setLanguage: () => {} });

export const I18nProvider = ({ children }) => {
  const dispatch = useDispatch();
  const language = useSelector(selectLanguage);

  const t = (key) => {
    const keys = key.split('.');
    let val = translations[language];
    for (const k of keys) val = val?.[k];
    if (val === undefined) {
      let fb = translations.en;
      for (const k of keys) fb = fb?.[k];
      return fb ?? key;
    }
    return val;
  };

  const setLanguage = (lang) => dispatch(setLang(lang));
  return <I18nContext.Provider value={{ t, language, setLanguage }}>{children}</I18nContext.Provider>;
};

export const useTranslation = () => useContext(I18nContext);
export default translations;