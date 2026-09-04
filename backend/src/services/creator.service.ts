import { creatorRepository } from '../repositories/creator.repository';

export class CreatorService {
  list(filters: { niche?: string; minFollowers?: number }) {
    return creatorRepository.list(filters);
  }

  getById(id: number) {
    return creatorRepository.findById(id);
  }

  getPortfolio(creatorId: number) {
    return creatorRepository.findById(creatorId);
  }
}

export const creatorService = new CreatorService();
