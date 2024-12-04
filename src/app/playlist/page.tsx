'use client';

import { useState } from 'react';

export default function Playlist() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('Falha ao criar playlist');
      }

      await response.json();

      alert("Playlist gerada com sucesso!");

    } catch (error) {
      console.log(error);
      throw new Error("Ocorreu um erro inesperado, tente novamente mais tarde!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={isLoading}
      className="bg-green-500 hover:bg-green-600"
    >
      {isLoading ? 'Criando...' : 'Create playlist'}
    </button>
  );
}