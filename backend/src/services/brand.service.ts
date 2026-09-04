import { brandRepository } from '../repositories/brand.repository';

export class BrandService {
  getById(id: number) {
    return brandRepository.findById(id);
  }
}

export const brandService = new BrandService();
