export interface EatenFish {
  id?: number;
  peixe_id: string;
  conteudo_peixe: string;
  tamanho_peixe: number;
  tubarao_id: number;
  tubarao_nome: string;
  hora_comeu: string;
  peixe_criado_em: string;
  x_captura: number;
  y_captura: number;
}

export interface EatFishDTO {
  peixe_id: string;
  tubarao_id: number;
  tubarao_nome: string;
  x_captura: number;
  y_captura: number;
}

export interface EatResult {
  success: boolean;
  tubarao_id?: number;
  peixes_comidos_total?: number;
  hora_comeu?: string;
}
