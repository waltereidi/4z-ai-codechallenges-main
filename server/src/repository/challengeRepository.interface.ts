import { Challenge } from '../domain/challenge.js';

export interface IChallengeRepository {
  findAll(): Challenge[];
  findById(id: string): Challenge | null;
}
