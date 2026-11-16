import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { config } from '../config';
import { UserStore, AuditLogStore } from '../models/store';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['user', 'admin', 'reviewer']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required')
});

function createToken(userId: string, role: string): string {
  return jwt.sign({ id: userId, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any
  });
}

function setCookie(res: Response, token: string) {
  res.cookie(config.cookieName, token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: config.env === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { email, password, name, role } = parsed.data;
    const existing = UserStore.findByEmail(email);

    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = UserStore.create({
      email,
      password: hashedPassword,
      name,
      role: role || 'user',
      quotaMinutes: 180,
      usedMinutes: 0
    });

    const token = createToken(newUser.id, newUser.role);
    setCookie(res, token);

    AuditLogStore.create({
      userId: newUser.id,
      userEmail: newUser.email,
      action: 'USER_REGISTERED',
      entityType: 'user',
      entityId: newUser.id
    });

    const { password: _, ...userSafe } = newUser;
    res.status(201).json({
      message: 'Registration successful',
      user: userSafe,
      token
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal registration error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { email, password } = parsed.data;
    const user = UserStore.findByEmail(email);

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = createToken(user.id, user.role);
    setCookie(res, token);

    AuditLogStore.create({
      userId: user.id,
      userEmail: user.email,
      action: 'USER_LOGGED_IN',
      entityType: 'user',
      entityId: user.id
    });

    const { password: _, ...userSafe } = user;
    res.json({
      message: 'Login successful',
      user: userSafe,
      token
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal login error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie(config.cookieName);
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const user = UserStore.findById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req: Request, res: Response): void => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const user = UserStore.findByEmail(email);
  if (user) {
    const resetToken = uuidv4();
    UserStore.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: new Date(Date.now() + 3600000).toISOString()
    });
  }

  // Always return success to prevent email enumeration
  res.json({
    message: 'If an account exists with this email, password reset instructions have been generated.',
    demoResetToken: user?.resetPasswordToken // Included for easy testing
  });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'Valid token and new password (min 6 characters) required.' });
    return;
  }

  const users = UserStore.find();
  const user = users.find((u: any) => u.resetPasswordToken === token);

  if (!user) {
    res.status(400).json({ error: 'Invalid or expired password reset token.' });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  UserStore.update(user.id, {
    password: hashedPassword,
    resetPasswordToken: undefined,
    resetPasswordExpires: undefined
  });

  res.json({ message: 'Password has been reset successfully. You can now log in.' });
});

// PUT /api/auth/profile
router.put('/profile', authenticate, (req: AuthRequest, res: Response): void => {
  const { name, avatar, organization } = req.body;
  const updated = UserStore.update(req.user!.id, {
    ...(name && { name }),
    ...(avatar !== undefined && { avatar }),
    ...(organization && { organization })
  });

  const { password: _, ...userSafe } = updated;
  res.json({ user: userSafe, message: 'Profile updated successfully' });
});

export default router;
