import { API_BASE } from '../utils/constants.js';
import { Challenge } from '../types/challenge.js';
import { Fish } from '../types/fish.js';
import { TankStats, EatFishPayload, EatFishResponse } from '../types/simulation.js';

export const challengeService = {
  async getChallenges(): Promise<Challenge[]> {
    const res = await fetch(`${API_BASE}/challenges`);
    if (!res.ok) {
      throw new Error(`Failed to fetch challenges: ${res.statusText}`);
    }
    return res.json();
  },

  async getChallengeById(id: string): Promise<Challenge | null> {
    const res = await fetch(`${API_BASE}/challenges/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch challenge ${id}: ${res.statusText}`);
    }
    return res.json();
  }
};

export const sharkTankService = {
  async getStats(): Promise<TankStats> {
    const res = await fetch(`${API_BASE}/shark-tank/stats`);
    if (!res.ok) {
      throw new Error(`Failed to fetch stats: ${res.statusText}`);
    }
    return res.json();
  },

  async createFish(fish: Fish): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/shark-tank/fish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fish)
    });
    if (!res.ok) {
      throw new Error(`Failed to create fish: ${res.statusText}`);
    }
    return res.json();
  },

  async recordEat(payload: EatFishPayload): Promise<EatFishResponse> {
    const res = await fetch(`${API_BASE}/shark-tank/eat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error(`Failed to record eat: ${res.statusText}`);
    }
    return res.json();
  },

  async reset(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/shark-tank/reset`, {
      method: 'POST'
    });
    if (!res.ok) {
      throw new Error(`Failed to reset tank: ${res.statusText}`);
    }
    return res.json();
  }
};
