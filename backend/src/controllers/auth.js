const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const otpHelper = require('../utils/otp');

const JWT_SECRET = process.env.JWT_SECRET || 'agrishield_fallback_secret_key_2026';
const JWT_EXPIRES_IN = '30d'; // Keep user logged in for 30 days per prompt

// Helper to sign 30-day JWT
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name || user.fullName || user.firstName || 'Farmer',
      email: user.email,
      phone: user.phone,
      role: user.role || 'customer'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// 1. CONTINUE WITH GOOGLE (POST /api/auth/google)
exports.google = async (req, res) => {
  try {
    const { email, name, picture, googleId } = req.body;

    if (!email && !googleId) {
      return res.status(400).json({ success: false, message: 'Google authentication details required' });
    }

    // Check if user already exists by googleId or email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          googleId ? { googleId } : undefined,
          email ? { email } : undefined
        ].filter(Boolean)
      }
    });

    if (existingUser) {
      // If returning user, update googleId/profileImage if empty
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          googleId: existingUser.googleId || googleId,
          profileImage: existingUser.profileImage || picture,
          isVerified: true
        }
      });

      const token = generateToken(updatedUser);
      return res.status(200).json({
        success: true,
        isNewUser: false,
        message: 'Login successful',
        token,
        user: updatedUser
      });
    }

    // New Google user: return Google data so frontend asks ONLY for missing fields (phone, village, pincode)
    return res.status(200).json({
      success: true,
      isNewUser: true,
      message: 'Please complete minimal farmer registration',
      googleData: {
        email,
        name,
        picture,
        googleId
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// 2. SEND OTP (POST /api/auth/send-otp)
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const result = await otpHelper.sendOTP(phone);
    res.status(200).json({
      success: true,
      message: result.message,
      otp: result.otp // Included for instant testing/demo in farmer app
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 3. VERIFY OTP (POST /api/auth/verify-otp)
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
    }

    const verification = otpHelper.verifyOTP(phone, otp);
    if (!verification.success) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    const cleanPhone = String(phone).trim().replace(/\D/g, '');

    // Check if user exists by phone
    const user = await prisma.user.findFirst({
      where: { phone: cleanPhone }
    });

    if (user) {
      // Returning user -> automatic login without asking registration
      const token = generateToken(user);
      return res.status(200).json({
        success: true,
        isNewUser: false,
        message: 'OTP verified. Login successful',
        token,
        user
      });
    }

    // New user -> prompt minimal registration
    return res.status(200).json({
      success: true,
      isNewUser: true,
      message: 'OTP verified. Please complete your farmer details',
      phone: cleanPhone
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// 4. REGISTER NEW USER (POST /api/auth/register)
exports.register = async (req, res) => {
  try {
    const {
      phone,
      email,
      googleId,
      firstName,
      lastName,
      name,
      village,
      pincode,
      profileImage
    } = req.body;

    const cleanPhone = phone ? String(phone).trim().replace(/\D/g, '') : null;
    const computedName = name || [firstName, lastName].filter(Boolean).join(' ') || 'Farmer';

    if (!cleanPhone && !email && !googleId) {
      return res.status(400).json({ success: false, message: 'Phone or Email is required for registration' });
    }

    // Check existing
    if (cleanPhone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone: cleanPhone } });
      if (existingPhone) {
        const token = generateToken(existingPhone);
        return res.status(200).json({
          success: true,
          message: 'User already exists. Logged in successfully.',
          token,
          user: existingPhone
        });
      }
    }

    if (email) {
      const existingEmail = await prisma.user.findFirst({ where: { email } });
      if (existingEmail) {
        const token = generateToken(existingEmail);
        return res.status(200).json({
          success: true,
          message: 'User already exists. Logged in successfully.',
          token,
          user: existingEmail
        });
      }
    }

    const newUser = await prisma.user.create({
      data: {
        firstName: firstName || computedName.split(' ')[0] || null,
        lastName: lastName || computedName.split(' ').slice(1).join(' ') || null,
        fullName: computedName,
        name: computedName,
        email: email || null,
        phone: cleanPhone || null,
        googleId: googleId || null,
        profileImage: profileImage || null,
        village: village || null,
        pincode: pincode || null,
        role: 'customer',
        isVerified: true
      }
    });

    const token = generateToken(newUser);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Registration failed: ' + error.message });
  }
};

// 5. LOGOUT (POST /api/auth/logout)
exports.logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// 6. GET USER PROFILE (GET /api/auth/profile)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// 7. UPDATE USER PROFILE (PUT /api/auth/profile)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      firstName,
      lastName,
      phone,
      village,
      pincode,
      email,
      profileImage
    } = req.body;

    const computedName = name || [firstName, lastName].filter(Boolean).join(' ');

    const updated = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        name: computedName || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        fullName: computedName || undefined,
        phone: phone ? String(phone).trim().replace(/\D/g, '') : undefined,
        village: village || undefined,
        pincode: pincode || undefined,
        email: email || undefined,
        profileImage: profileImage || undefined
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updated
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Update failed: ' + error.message });
  }
};

// 8. ADMIN GET ALL USERS (GET /api/auth/admin/users)
exports.getAdminUsers = async (req, res) => {
  try {
    const { search } = req.query;

    const where = search ? {
      OR: [
        { phone: { contains: search } },
        { name: { contains: search } },
        { fullName: { contains: search } },
        { village: { contains: search } },
        { email: { contains: search } }
      ]
    } : {};

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(u => ({
        id: u.id,
        fullName: u.fullName || u.name || 'Farmer',
        phone: u.phone || 'N/A',
        email: u.email || 'N/A',
        village: u.village || 'N/A',
        pincode: u.pincode || 'N/A',
        registrationDate: u.createdAt,
        authType: u.googleId ? 'Google' : (u.phone ? 'Phone OTP' : 'Legacy'),
        role: u.role
      }))
    });
  } catch (error) {
    console.error('Get Admin Users Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users: ' + error.message });
  }
};

// Legacy support for PHP fallback routes
exports.legacyRegister = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || (!email && !phone)) {
      return res.status(400).json({ message: 'Incomplete data.' });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const user = await prisma.user.create({
      data: {
        name,
        fullName: name,
        email: email || null,
        phone: phone ? String(phone).trim().replace(/\D/g, '') : null,
        password: hashedPassword,
        role: 'customer'
      }
    });

    const token = generateToken(user);
    res.status(201).json({ message: 'User registered successfully.', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Database error: ' + error.message });
  }
};

exports.legacyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone: email }] }
    });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.password && password) {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.status(200).json({ message: 'Login successful', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Database error: ' + error.message });
  }
};
