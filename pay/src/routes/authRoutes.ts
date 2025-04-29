// src/routes/authRoutes.ts
import { Router, Request, Response } from 'express';
import { RegisterRequest, LoginRequest, GoogleLoginRequest } from '../types/authTypes';

const router = Router();

// Handlers
const registerHandler = async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  try {
    const { email, password } = req.body;
    // TODO: implement registration logic
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error });
  }
};

const loginHandler = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;
    // TODO: implement login logic
    return res.status(200).json({ message: 'User logged in successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error });
  }
};

const googleLoginHandler = async (req: Request<{}, {}, GoogleLoginRequest>, res: Response) => {
  try {
    const { idToken } = req.body;
    // TODO: implement google login logic
    return res.status(200).json({ message: 'Google login successful' });
  } catch (error) {
    return res.status(500).json({ message: 'Google login failed', error });
  }
};
router.get('/test', (req: Request, res: Response) => {
    res.send('Auth routes are working!');
  });
  
  router.post('/register', registerHandler);
  // ... other routes
// Routes
// router.post('/register', registerHandler);
router.post('/auth/login', loginHandler);
router.post('/auth/google-login', googleLoginHandler);

export default router;
