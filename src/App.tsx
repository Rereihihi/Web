import { useState, useEffect } from 'react';
import { supabase } from './supabase';

function App() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedTimes, setSavedTimes] = useState<{ id: number; time_record: string; created_at: string }[]>([]);

  const fetchTimes = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('saved_times').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error fetching times:', error); } else { setSavedTimes(data || []); }
    setIsLoading(false);
  };

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) { interval = setInterval(() => { setTime(prevTime => prevTime + 1); }, 1000); }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => { fetchTimes(); }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleStartStop = () => { setIsRunning(!isRunning); };

  const handleSaveAndReset = async () => {
    if (time === 0) return;
    setIsRunning(false);
    setIsLoading(true);
    const timeRecord = formatTime(time);
    const { error } = await supabase.from('saved_times').insert([{ time_record: timeRecord }]);
    if (error) { alert('Error saving time: ' + error.message); } 
    else {
      alert(`บันทึกเวลา ${timeRecord} สำเร็จ!`);
      setTime(0);
      await fetchTimes();
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center font-mono p-4">
      <div className="text-center w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-2xl">
        <h1 className="text-3xl font-bold mb-4">Stopwatch</h1>
        <p className="text-7xl font-bold tracking-widest mb-6">{formatTime(time)}</p>
        <div className="flex justify-center gap-4 mb-8">
          <button onClick={handleStartStop} className={`w-32 py-3 text-lg font-semibold rounded-lg transition-colors ${ isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600' }`}>{isRunning ? 'Stop' : 'Start'}</button>
          <button onClick={handleSaveAndReset} disabled={isLoading || isRunning} className="w-32 py-3 text-lg font-semibold rounded-lg transition-colors bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed">{isLoading ? 'Saving...' : 'Save'}</button>
        </div>
        <div className="text-left w-full">
          <h2 className="text-xl font-bold border-b border-gray-600 pb-2 mb-2">Saved Times</h2>
          {isLoading ? <p>Loading...</p> : (
            <ul className="max-h-60 overflow-y-auto">
              {savedTimes.map(record => (
                <li key={record.id} className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-lg">{record.time_record}</span>
                  <span className="text-xs text-gray-400">{new Date(record.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
export default App;