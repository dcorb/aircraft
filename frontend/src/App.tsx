import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/message')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setMessage(data.message);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">
          Backend Message Example
        </h1>
        {loading && <p className="text-gray-500 animate-pulse">Loading...</p>}
        {error && <p className="text-red-600 font-semibold">Error: {error}</p>}
        {!loading && !error && (
          <p className="text-lg text-gray-800">{message}</p>
        )}
      </div>
    </div>
  );
}

export default App;
