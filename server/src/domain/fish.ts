export type FishStatus = 'ativo' | 'comido';

export interface Fish {
  id: string;
  conteudo: string;
  tamanho: number;
  x: number;
  y: number;
  cor: string;
  criado_em: string;
  status: FishStatus;
}

export interface CreateFishDTO {
  id: string;
  conteudo: string;
  tamanho: number;
  x: number;
  y: number;
  cor?: string;
  criado_em?: string;
}

export class FishDomain {
  static validate(dto: CreateFishDTO): void {
    if (!dto.id || typeof dto.id !== 'string') {
      throw new Error('Fish ID must be a non-empty string');
    }
    if (typeof dto.tamanho !== 'number' || dto.tamanho <= 0) {
      throw new Error('Fish size must be a positive number');
    }
    if (typeof dto.x !== 'number' || typeof dto.y !== 'number') {
      throw new Error('Fish coordinates must be valid numbers');
    }
  }

  static create(dto: CreateFishDTO): Fish {
    this.validate(dto);
    return {
      id: dto.id,
      conteudo: dto.conteudo ?? '',
      tamanho: dto.tamanho,
      x: dto.x,
      y: dto.y,
      cor: dto.cor || '#38bdf8',
      criado_em: dto.criado_em || new Date().toISOString(),
      status: 'ativo'
    };
  }
}
