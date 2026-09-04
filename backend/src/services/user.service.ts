import { userRepository } from '../repositories/user.repository';

export class UserService {
  getProfile(userId: number) {
    return userRepository.findById(userId);
  }

  updateProfile(userId: number, data: Partial<{ email: string; passwordHash: string; role: string }>) {
    return userRepository.update(userId, data);
  }
}

export const userService = new UserService();
