import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DifficultyPill } from './DifficultyPill.js';

describe('DifficultyPill Component', () => {
  it('renders "Fácil" with correct class', () => {
    const { container } = render(<DifficultyPill difficulty="Fácil" />);
    expect(screen.getByText('Fácil')).toBeDefined();
    expect(container.querySelector('.pill-easy')).toBeDefined();
  });

  it('renders "Médio" with correct class', () => {
    const { container } = render(<DifficultyPill difficulty="Médio" />);
    expect(screen.getByText('Médio')).toBeDefined();
    expect(container.querySelector('.pill-medium')).toBeDefined();
  });

  it('renders "Difícil" with correct class', () => {
    const { container } = render(<DifficultyPill difficulty="Difícil" />);
    expect(screen.getByText('Difícil')).toBeDefined();
    expect(container.querySelector('.pill-hard')).toBeDefined();
  });

  it('renders unknown difficulty fallback', () => {
    render(<DifficultyPill difficulty="Expert" />);
    expect(screen.getByText('Expert')).toBeDefined();
  });
});
