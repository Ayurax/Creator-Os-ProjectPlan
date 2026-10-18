import { userRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { HttpError } from '../utils/errors';
import { UserRole } from '../types';

type RegistrationProfile = Record<string, unknown>;

const text = (profile: RegistrationProfile, key: string, label: string) => {
  const value = profile[key];
  if (typeof value !== 'string' || !value.trim()) throw new HttpError(400, `${label} is required`);
  return value.trim();
};

const optionalText = (profile: RegistrationProfile, key: string) => {
  const value = profile[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
};

const optionalUrl = (profile: RegistrationProfile, key: string, label: string) => {
  const value = optionalText(profile, key);
  if (value) {
    try {
      new URL(value);
    } catch {
      throw new HttpError(400, `${label} must be a valid URL`);
    }
  }
  return value;
};

const optionalNumber = (
  profile: RegistrationProfile,
  key: string,
  label: string,
  isValid: (value: number) => boolean,
) => {
  if (profile[key] === undefined || profile[key] === null || profile[key] === '') return null;
  const value = profile[key];
  if (typeof value !== 'number' || !Number.isFinite(value) || !isValid(value)) {
    throw new HttpError(400, `${label} must be a valid number`);
  }
  return value;
};

export class AuthService {
  async register(input: { email: string; password: string; role: UserRole; profile?: RegistrationProfile }) {
    const email = input.email?.trim().toLowerCase();
    const profile = input.profile ?? {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpError(400, 'Enter a valid email address');
    }
    if (!input.password || input.password.length < 8) {
      throw new HttpError(400, 'Password must be at least 8 characters');
    }
    if (!['BRAND', 'CREATOR', 'FREELANCER', 'TALENT_MANAGER'].includes(input.role)) {
      throw new HttpError(400, 'Select a valid account role');
    }
    if (await userRepository.findByEmail(email)) {
      throw new HttpError(409, 'Email already in use');
    }

    const passwordHash = await hashPassword(input.password);
    const baseData = {
      email,
      passwordHash,
      role: input.role,
      displayName: text(profile, 'displayName', 'Full name'),
    };

    const data =
      input.role === 'BRAND'
        ? {
            ...baseData,
            brand: {
              create: {
                companyName: text(profile, 'companyName', 'Company name'),
                industry: text(profile, 'industry', 'Industry'),
                website: optionalUrl(profile, 'website', 'Company website'),
                description: optionalText(profile, 'description'),
              },
            },
          }
        : input.role === 'CREATOR'
          ? {
              ...baseData,
              creator: {
                create: {
                  bio: optionalText(profile, 'bio'),
                  niche: text(profile, 'niche', 'Content niche'),
                  platforms: optionalText(profile, 'platforms'),
                  followers: optionalNumber(profile, 'followers', 'Follower count', (value) => Number.isInteger(value) && value >= 0),
                  engagementRate: optionalNumber(
                    profile,
                    'engagementRate',
                    'Engagement rate',
                    (value) => value >= 0 && value <= 100,
                  ),
                },
              },
            }
          : input.role === 'FREELANCER'
            ? {
                ...baseData,
                freelancer: {
                  create: {
                    skills: text(profile, 'skills', 'Primary skills'),
                    hourlyRate: optionalNumber(profile, 'hourlyRate', 'Hourly rate', (value) => value >= 0),
                    availability: optionalText(profile, 'availability'),
                    portfolioUrl: optionalUrl(profile, 'portfolioUrl', 'Portfolio URL'),
                  },
                },
              }
            : {
                ...baseData,
                talentManager: {
                  create: {
                    agencyName: optionalText(profile, 'agencyName'),
                    specialty: optionalText(profile, 'specialty'),
                    bio: optionalText(profile, 'bio'),
                  },
                },
              };

    const user = await userRepository.create(data);
    const token = signToken({ userId: user.id, role: user.role });
    return { token, user: { id: user.id, email: user.email, role: user.role, displayName: user.displayName } };
  }

  async login(input: { email: string; password: string }) {
    const user = await userRepository.findByEmail(input.email.trim().toLowerCase());
    if (!user || !(await comparePassword(input.password, user.passwordHash))) {
      throw new HttpError(401, 'Invalid credentials');
    }
    const token = signToken({ userId: user.id, role: user.role });
    return { token, user: { id: user.id, email: user.email, role: user.role, displayName: user.displayName } };
  }

  async me(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) throw new HttpError(404, 'User not found');
    return { id: user.id, email: user.email, role: user.role, displayName: user.displayName };
  }
}

export const authService = new AuthService();
