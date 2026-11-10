export interface EatenLogItem {
  id: number | string;
  peixe_id: string;
  tubarao_nome: string;
  tamanho_peixe: number;
  conteudo_peixe: string;
  hora_comeu: string;
}

export interface SharkCount {
  tubarao_id: number;
  tubarao_nome: string;
  count: number;
}

export interface TankStats {
  totalPeixesCriados: number;
  totalPeixesComidos: number;
  sharksCounts: SharkCount[];
  historicoRecente: EatenLogItem[];
}

export interface EatFishPayload {
  peixe_id: string;
  tubarao_id: number;
  tubarao_nome: string;
  x_captura: number;
  y_captura: number;
}

export interface EatFishResponse {
  success: boolean;
  tubarao_id?: number;
  peixes_comidos_total?: number;
  hora_comeu?: string;
}
