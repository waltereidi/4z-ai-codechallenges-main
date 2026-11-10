import { useState, useEffect, useCallback } from 'react';
import { Challenge } from '../types/challenge.js';
import { challengeService } from '../services/api.js';

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadChallengeDetail = useCallback(async (id: string) => {
    try {
      const data = await challengeService.getChallengeById(id);
      setSelectedChallenge(data);
      setSidebarOpen(false);
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err);
      setError('Erro ao carregar detalhes do desafio');
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    challengeService.getChallenges()
      .then(data => {
        if (!mounted) return;
        setChallenges(data);
        if (data.length > 0) {
          loadChallengeDetail(data[0].id);
        } else {
          setSelectedChallenge(null);
        }
      })
      .catch(err => {
        if (!mounted) return;
        console.error('Erro ao conectar com API:', err);
        setError('Erro ao conectar com API');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [loadChallengeDetail]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return {
    challenges,
    selectedChallenge,
    sidebarOpen,
    loading,
    error,
    loadChallengeDetail,
    toggleSidebar,
    closeSidebar
  };
}
