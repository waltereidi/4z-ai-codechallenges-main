import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { challengeService, sharkTankService } from './api.js';

describe('API Services', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('challengeService.getChallenges calls /api/challenges and returns data', async () => {
    const mockData = [{ id: '1', title: 'Test Challenge' }];
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData
    } as unknown as Response);

    const result = await challengeService.getChallenges();
    expect(result).toEqual(mockData);
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/challenges');
  });

  it('sharkTankService.createFish sends POST request with correct payload', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    } as unknown as Response);

    const fish = {
      id: 'f1',
      conteudo: 'alga',
      tamanho: 20,
      x: 10,
      y: 20,
      cor: '#ff0000',
      criado_em: new Date().toISOString()
    };

    const res = await sharkTankService.createFish(fish);
    expect(res.success).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/shark-tank/fish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fish)
    });
  });

  it('sharkTankService.reset sends POST request to reset', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    } as unknown as Response);

    const res = await sharkTankService.reset();
    expect(res.success).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/shark-tank/reset', {
      method: 'POST'
    });
  });
});
