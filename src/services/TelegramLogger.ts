
const BOT_TOKEN = '8575086263:AAG74PmRjUT8ExtDkC_kOxfYfmss2BG0C_A';
const CHAT_ID = '-1004498586017';

export const logToTelegram = async (message: string) => {
  try {
    const text = encodeURIComponent(`🎰 [METRO CASH]\n${message}`);
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${text}&parse_mode=HTML`);
  } catch (e) {
    console.error('Bot logging failed', e);
  }
};
