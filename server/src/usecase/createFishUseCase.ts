import { CreateFishDTO, FishDomain } from '../domain/fish.js';
import { IFishRepository } from '../repository/fishRepository.interface.js';

export class CreateFishUseCase {
  constructor(private readonly fishRepository: IFishRepository) {}

  execute(dto: CreateFishDTO): { success: boolean } {
    const fish = FishDomain.create(dto);
    this.fishRepository.create(fish);
    return { success: true };
  }
}
