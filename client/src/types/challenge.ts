export type ChallengeDifficulty = 'Fácil' | 'Médio' | 'Difícil';

export interface Challenge {
  id: string;
  title: string;
  category: string;
  difficulty: ChallengeDifficulty;
  type: string;
  description: string;
}
