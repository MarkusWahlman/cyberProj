import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import passport from './config/passport.ts';
import authRoutes from './routes/authRoutes.ts';
import { initializeDb, pool } from './config/db.ts';
import { errorHandler } from './middlewares/errorHandler.ts';
import logger from './utils/logger.ts';

const app = express();

// Initialize Database
await initializeDb().catch(logger.error);

// Session setup
const pgSession = connectPgSimple(session);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new pgSession({
    pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
