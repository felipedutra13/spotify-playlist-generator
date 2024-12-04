"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    content: '',
    numberOfSongs: '',
    title: ''
  });

  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true);

      const response = await fetch('/api/playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Falha ao criar playlist');
      }

      alert("Playlist criada com sucesso!");
      setFormData({
        content: '',
        numberOfSongs: '',
        title: ''
      });
    } catch (error) {
      console.error('Erro:', error);
      alert("Ocorreu um erro inesperado, tente novamente mais tarde!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (

    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎵</span>
            <h1 className="text-xl font-bold text-black">Gerador de Playlist</h1>
          </div>
          <p className="text-gray-600">
            Crie playlists personalizadas usando Inteligência Artificial!
          </p>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-2">
            <span className="text-green-500">ℹ️</span>
            <p className="text-sm text-green-700">
              Digite uma descrição do tipo de música que você quer (por exemplo: &quot;rock dos anos 80 para malhar&quot;
              ou &quot;música brasileira relaxante para estudar&quot;), escolha quantas músicas deseja e dê um nome para sua playlist.
            </p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="longText" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={4}
            className="text-black w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
            Quantidade de músicas
          </label>
          <input
            type="number"
            id="numberOfSongs"
            name="numberOfSongs"
            value={formData.numberOfSongs}
            onChange={handleChange}
            min="1"
            max="50"
            className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
            Título da Playlist
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading ? 'Criando...' : 'Criar playlist'}
        </button>
      </form>

      <section className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4 text-black">Dicas para melhores resultados</h2>
        <ul className="space-y-2 list-disc pl-4 text-gray-700">
          <li>Seja específico com gêneros musicais, artistas de referência ou ocasiões</li>
          <li>Inclua o humor ou energia desejada (ex: alegre, melancólica, energética)</li>
          <li>Mencione instrumentos específicos se desejar (ex: músicas com piano prominente)</li>
          <li>Adicione contexto temporal se relevante (ex: clássicos dos anos 90)</li>
        </ul>
      </section>

    </div>
  );
}
