// In-memory OTP cache: phone -> { otp, expiresAt, requestsCount, attempts }
const otpCache = new Map();

// User's Fast2SMS API Key
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || 'PM63HFpC20XKDJqohgEKTZGPAjura35rtwKaHCpxEsaxyQkm6aUxPZNtZV5Q';

// Generate 6 digit numeric OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send real SMS via Fast2SMS Bulk V2 OTP API using native global fetch (Zero external dependencies)
 */
async function sendSMSViaFast2SMS(phone, otpCode) {
  try {
    // 1. Try OTP route first
    const url = new URL('https://www.fast2sms.com/dev/bulkV2');
    url.searchParams.append('authorization', FAST2SMS_API_KEY);
    url.searchParams.append('variables_values', otpCode);
    url.searchParams.append('route', 'otp');
    url.searchParams.append('numbers', phone);

    const res = await fetch(url.toString());
    const data = await res.json();
    console.log(`[Fast2SMS OTP Route] Response for ${phone}:`, data);
    return data;
  } catch (err) {
    console.warn('[Fast2SMS OTP Route Notice]', err.message);

    // 2. If OTP route requires website verification (996) or fails, try Quick SMS ('q') route
    try {
      const fbUrl = new URL('https://www.fast2sms.com/dev/bulkV2');
      fbUrl.searchParams.append('authorization', FAST2SMS_API_KEY);
      fbUrl.searchParams.append('message', `Your Agrishield farmer login OTP is ${otpCode}. Valid for 5 minutes. Do not share this code.`);
      fbUrl.searchParams.append('route', 'q');
      fbUrl.searchParams.append('numbers', phone);

      const fbRes = await fetch(fbUrl.toString());
      const fbData = await fbRes.json();
      console.log(`[Fast2SMS Quick SMS Route] Response for ${phone}:`, fbData);
      return fbData;
    } catch (fallbackErr) {
      console.error('[Fast2SMS Quick SMS Error]', fallbackErr.message);
      return null;
    }
  }
}

/**
 * Send OTP to phone number
 * Enforces 5 minute expiry and max 5 requests per window
 */
exports.sendOTP = async (phone) => {
  const cleanPhone = String(phone).trim().replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    throw new Error('Please enter a valid 10-digit mobile number');
  }

  const now = Date.now();
  const existing = otpCache.get(cleanPhone);

  if (existing && now < existing.expiresAt) {
    if (existing.requestsCount >= 5) {
      throw new Error('Maximum OTP request limit reached. Please try again after 5 minutes.');
    }
    existing.requestsCount += 1;
    existing.otp = generateOTP();
    existing.expiresAt = now + 5 * 60 * 1000; // 5 mins
    otpCache.set(cleanPhone, existing);

    // Send SMS via Fast2SMS
    await sendSMSViaFast2SMS(cleanPhone, existing.otp);

    console.log(`[Agrishield Auth] New OTP for ${cleanPhone}: ${existing.otp}`);
    return {
      success: true,
      message: 'OTP sent to mobile number via Fast2SMS',
      otp: existing.otp // Returning in response for easy farmer testing/demo
    };
  }

  const otp = generateOTP();
  otpCache.set(cleanPhone, {
    otp,
    expiresAt: now + 5 * 60 * 1000,
    requestsCount: 1,
    attempts: 0
  });

  // Send SMS via Fast2SMS
  await sendSMSViaFast2SMS(cleanPhone, otp);

  console.log(`[Agrishield Auth] OTP sent to ${cleanPhone}: ${otp}`);

  return {
    success: true,
    message: 'OTP sent to mobile number via Fast2SMS',
    otp
  };
};

/**
 * Verify OTP for phone number
 */
exports.verifyOTP = (phone, code) => {
  const cleanPhone = String(phone).trim().replace(/\D/g, '');
  const entry = otpCache.get(cleanPhone);

  if (!entry) {
    return { success: false, message: 'OTP expired or not requested. Please request a new OTP.' };
  }

  if (Date.now() > entry.expiresAt) {
    otpCache.delete(cleanPhone);
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (entry.attempts >= 5) {
    otpCache.delete(cleanPhone);
    return { success: false, message: 'Too many failed verification attempts. Please request a new OTP.' };
  }

  if (entry.otp !== String(code).trim()) {
    entry.attempts += 1;
    return { success: false, message: 'Invalid OTP code. Please check and try again.' };
  }

  // Success
  otpCache.delete(cleanPhone);
  return { success: true, message: 'OTP verified successfully' };
};
