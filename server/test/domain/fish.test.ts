import { describe, it, expect } from 'vitest';
import { FishDomain } from '../../src/domain/fish.js';

describe('FishDomain', () => {
  it('should validate and create a valid fish entity with default status "ativo"', () => {
    const fish = FishDomain.create({
      id: 'fish_1',
      conteudo: 'test_content',
      tamanho: 20,
      x: 10,
      y: 50,
      cor: '#f43f5e'
    });

    expect(fish.id).toBe('fish_1');
    expect(fish.conteudo).toBe('test_content');
    expect(fish.tamanho).toBe(20);
    expect(fish.x).toBe(10);
    expect(fish.y).toBe(50);
    expect(fish.cor).toBe('#f43f5e');
    expect(fish.status).toBe('ativo');
    expect(fish.criado_em).toBeDefined();
  });

  it('should apply fallback default color if none provided', () => {
    const fish = FishDomain.create({
      id: 'fish_2',
      conteudo: 'blue_fish',
      tamanho: 15,
      x: 30,
      y: 40
    });

    expect(fish.cor).toBe('#38bdf8');
  });

  it('should throw an error if id is invalid', () => {
    expect(() => {
      FishDomain.create({
        id: '',
        conteudo: 'empty',
        tamanho: 10,
        x: 5,
        y: 5
      });
    }).toThrow('Fish ID must be a non-empty string');
  });

  it('should throw an error if size is not a positive number', () => {
    expect(() => {
      FishDomain.create({
        id: 'fish_neg',
        conteudo: 'bad_size',
        tamanho: 0,
        x: 5,
        y: 5
      });
    }).toThrow('Fish size must be a positive number');
  });
});
