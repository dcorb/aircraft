import { useEffect, useState } from 'react';
import './App.css';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';
import { Loader2 } from 'lucide-react';

function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const url = apiUrl ? `${apiUrl}/api/flights` : '/api/flights';
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        // Don't use the response, just print OK
        setMessage('OK');
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-700">
            Backend Message Example
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {loading && (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-muted-foreground">Loading...</span>
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>Error: {error}</AlertDescription>
            </Alert>
          )}
          {!loading && !error && (
            <p className="text-lg text-foreground">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
