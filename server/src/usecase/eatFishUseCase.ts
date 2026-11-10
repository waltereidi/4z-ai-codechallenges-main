import { EatFishDTO, EatResult } from '../domain/eatenFish.js';
import { IFishRepository } from '../repository/fishRepository.interface.js';
import { IEatenFishRepository } from '../repository/eatenFishRepository.interface.js';

export class EatFishUseCase {
  constructor(
    private readonly fishRepository: IFishRepository,
    private readonly eatenFishRepository: IEatenFishRepository
  ) {}

  execute(dto: EatFishDTO): EatResult {
    const { peixe_id, tubarao_id, tubarao_nome, x_captura, y_captura } = dto;
    const peixe = this.fishRepository.findById(peixe_id);

    if (!peixe) {
      return { success: false };
    }

    const hora_comeu = new Date().toISOString();

    this.eatenFishRepository.record({
      peixe_id: peixe.id,
      conteudo_peixe: peixe.conteudo,
      tamanho_peixe: peixe.tamanho,
      tubarao_id,
      tubarao_nome,
      hora_comeu,
      peixe_criado_em: peixe.criado_em,
      x_captura,
      y_captura
    });

    this.fishRepository.markAsEaten(peixe_id);
    const count = this.eatenFishRepository.countByShark(tubarao_id);

    return {
      success: true,
      tubarao_id,
      peixes_comidos_total: count,
      hora_comeu
    };
  }
}
