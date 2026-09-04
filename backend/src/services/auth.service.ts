import { userRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { HttpError } from '../utils/errors';
import { UserRole } from '../types';

export class AuthService {
  async register(input: {
    email: string;
    password: string;
    role: UserRole;
    profile?: Record<string, unknown>;
  }) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new HttpError(409, 'Email already in use');
    }
    const passwordHash = await hashPassword(input.password);

    const role = input.role;
    const baseData: { email: string; passwordHash: string; role: string } = {
      email: input.email,
      passwordHash,
      role,
    };

    const data =
      role === 'BRAND'
        ? {
            ...baseData,
            brand: {
              create: {
                companyName: String(input.profile?.companyName ?? 'Unnamed Brand'),
                industry: input.profile?.industry ? String(input.profile.industry) : null,
                description: input.profile?.description ? String(input.profile.description) : null,
              },
            },
          }
        : role === 'CREATOR'
          ? {
              ...baseData,
              creator: {
                create: {
                  bio: input.profile?.bio ? String(input.profile.bio) : null,
                  niche: input.profile?.niche ? String(input.profile.niche) : null,
                  followers: typeof input.profile?.followers === 'number' ? input.profile.followers : null,
                  engagementRate:
                    typeof input.profile?.engagementRate === 'number' ? input.profile.engagementRate : null,
                },
              },
            }
          : role === 'FREELANCER'
            ? {
                ...baseData,
                freelancer: {
                  create: {
                    skills: input.profile?.skills ? String(input.profile.skills) : null,
                    hourlyRate: typeof input.profile?.hourlyRate === 'number' ? input.profile.hourlyRate : null,
                    availability: input.profile?.availability ? String(input.profile.availability) : null,
                  },
                },
              }
            : {
                ...baseData,
                talentManager: { create: {} },
              };

    const user = await userRepository.create(data);
    const token = signToken({ userId: user.id, role: user.role });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }

  async login(input: { email: string; password: string }) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new HttpError(401, 'Invalid credentials');
    }
    const ok = await comparePassword(input.password, user.passwordHash);
    if (!ok) {
      throw new HttpError(401, 'Invalid credentials');
    }
    const token = signToken({ userId: user.id, role: user.role });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }

  async me(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }
    return { id: user.id, email: user.email, role: user.role };
  }
}

export const authService = new AuthService();