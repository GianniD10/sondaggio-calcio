import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const players = [
  "Biagio Barbarossa",
  "Domenico Patruno",
  "Francesco Matarrese",
  "Gianni Destino",
  "Giuseppe Acquaviva",
  "Luca Bob Del Vento",
  "Luca Di Muro",
  "Ludovico Barnabà",
  "Mariano Di Nicoli",
  "Nicola Iacobone",
  "Simone Palermo"
];

const questions = [
  { category: "🧠 Tecnica individuale", items: [
    "Chi ha il miglior dribbling?",
    "Chi ha il tiro più potente?",
    "Chi ha il tiro più preciso?",
    "Chi controlla meglio la palla sotto pressione?",
    "Chi fa i passaggi più intelligenti?",
    "Chi è più bravo nei colpi di testa?",
    "Chi ha il primo tocco più pulito?"
  ]},
  { category: "🏃‍♂️ Fisico e atletismo", items: [
    "Chi corre di più durante la partita?",
    "Chi è il più veloce sullo scatto breve?",
    "Chi resiste meglio fino alla fine (stamina)?",
    "Chi è più forte nei contrasti?",
    "Chi recupera più palloni?"
  ]},
  { category: "🧩 Intelligenza tattica", items: [
    "Chi capisce meglio il gioco?",
    "Chi si posiziona sempre nel posto giusto?",
    "Chi dà le migliori indicazioni ai compagni?",
    "Chi sa leggere meglio le azioni avversarie?"
  ]},
  { category: "🎯 Precisione e finalizzazione", items: [
    "Chi segna più gol?",
    "Chi crea più occasioni da gol?",
    "Chi sbaglia meno davanti alla porta?",
    "Chi è più freddo nei momenti decisivi?"
  ]},
  { category: "🤝 Spirito di squadra e atteggiamento", items: [
    "Chi aiuta di più i compagni?",
    "Chi parla di più in campo (comunicazione)?",
    "Chi mantiene la calma anche quando si perde?",
    "Chi ha più 'leadership'?",
    "Chi si diverte di più giocando?"
  ]},
  { category: "😂 Bonus divertenti", items: [
    "Chi fa più tunnel?",
    "Chi fa più falli 'strategici'?",
    "Chi si lamenta di più con l'arbitro?",
    "Chi si butta per terra anche senza fallo?",
    "Chi ha la miglior esultanza dopo un gol?"
  ]}
];

export default function SoccerSurvey() {
  const [userName, setUserName] = useState('');
  const [userSubmitted, setUserSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [allVotes, setAllVotes] = useState({});
  const [loading, setLoading] = useState(true);

  const allQuestions = questions.flatMap(cat => 
    cat.items.map(q => ({ category: cat.category, question: q }))
  );

  useEffect(() => {
    loadVotes();
  }, []);

  const loadVotes = async () => {
    try {
      const result = await window.storage.get('soccer-votes', true);
      if (result) {
        setAllVotes(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('Nessun voto precedente trovato');
    }
    setLoading(false);
  };

  const saveVotes = async (votes) => {
    try {
      await window.storage.set('soccer-votes', JSON.stringify(votes), true);
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
    }
  };

  const handleUserSubmit = () => {
    if (userName.trim()) {
      setUserSubmitted(true);
    }
  };

  const handleAnswer = (player) => {
    const newAnswers = { ...answers, [currentQuestionIndex]: player };
    setAnswers(newAnswers);
    
    if (currentQuestionIndex < allQuestions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(currentQuestionIndex + 1), 300);
    } else {
      submitSurvey(newAnswers);
    }
  };

  const submitSurvey = async (finalAnswers) => {
    const newVotes = { ...allVotes };
    
    Object.keys(finalAnswers).forEach(qIndex => {
      const questionKey = `q${qIndex}`;
      if (!newVotes[questionKey]) {
        newVotes[questionKey] = {};
      }
      const player = finalAnswers[qIndex];
      newVotes[questionKey][player] = (newVotes[questionKey][player] || 0) + 1;
    });

    await saveVotes(newVotes);
    setAllVotes(newVotes);
    setShowResults(true);
  };

  const getResults = (questionIndex) => {
    const questionKey = `q${questionIndex}`;
    const votes = allVotes[questionKey] || {};
    const total = Object.values(votes).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) return [];

    return Object.entries(votes)
      .map(([player, count]) => ({
        player,
        votes: count,
        percentage: ((count / total) * 100).toFixed(1)
      }))
      .sort((a, b) => b.votes - a.votes);
  };

  const resetSurvey = () => {
    setUserName('');
    setUserSubmitted(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
        <div className="text-white text-2xl">Caricamento...</div>
      </div>
    );
  }

  if (!userSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            ⚽ Sondaggio Calcistico
          </h1>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Inserisci il tuo Nome e Cognome:
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 mb-4"
              placeholder="Es: Mario Rossi"
            />
            <button
              onClick={handleUserSubmit}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              Inizia il Sondaggio
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-2xl p-8 mb-6">
            <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
              📊 Risultati Sondaggio
            </h1>
            <p className="text-center text-gray-600 mb-6">
              Grazie {userName} per aver partecipato!
            </p>
            <button
              onClick={resetSurvey}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mb-6"
            >
              Compila un altro sondaggio
            </button>
          </div>

          {allQuestions.map((q, index) => {
            const results = getResults(index);
            const winner = results[0];
            
            return (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-1">{q.category}</h3>
                <h2 className="text-xl font-bold text-gray-800 mb-4">{q.question}</h2>
                
                {results.length > 0 ? (
                  <>
                    <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-4">
                      <p className="text-lg">
                        <span className="font-bold">🏆 {winner.player}</span>
                        <span className="text-green-700 ml-2">({winner.percentage}%)</span>
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      {results.map((result, i) => (
                        <div key={i} className="flex items-center">
                          <span className="w-48 text-sm text-gray-700 truncate">{result.player}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-6 mx-2">
                            <div
                              className="bg-green-500 h-6 rounded-full flex items-center justify-end px-2"
                              style={{ width: `${result.percentage}%` }}
                            >
                              <span className="text-xs text-white font-semibold">
                                {result.percentage}%
                              </span>
                            </div>
                          </div>
                          <span className="w-12 text-sm text-gray-600 text-right">{result.votes}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 italic">Nessun voto ancora</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const currentQ = allQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Domanda {currentQuestionIndex + 1} di {allQuestions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-500 mb-2">{currentQ.category}</p>
          <h2 className="text-2xl font-bold text-gray-800">{currentQ.question}</h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {players.map((player) => (
            <button
              key={player}
              onClick={() => handleAnswer(player)}
              className="bg-gray-100 hover:bg-green-500 hover:text-white text-left px-6 py-4 rounded-lg transition duration-200 font-medium text-gray-700 hover:shadow-lg"
            >
              {player}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
