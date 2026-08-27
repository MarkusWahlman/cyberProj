import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { authService } from '../services/authService.ts';

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await authService.verifyCredentials(username, password);
      if (!user) {
        return done(null, false, { message: 'Invalid credentials.' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await authService.getUserById(id);
    done(null, user || null);
  } catch (error) {
    done(error);
  }
});

export default passport;
