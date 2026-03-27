'use client';
import { useState } from 'react';
import * as xlsx from 'xlsx';

export default function Home() {
  const [courses, setCourses] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = xlsx.read(event.target?.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      setCourses(data);
    };
    reader.readAsBinaryString(file);
  };

  const analyzeTranscript = async () => {
    setLoading(true);
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courses, targetSchool: 'TUM_Informatics' }),
    });
    
    const data = await response.json();
    setAnalysis(data.result);
    setLoading(false);
  };

  return (
    <main className="p-10 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">German MSc Matching Engine</h1>
      
      <div className="border-2 border-dashed border-gray-400 p-10 text-center rounded-lg">
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      </div>

      {courses.length > 0 && (
        <button 
          onClick={analyzeTranscript} 
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? 'Analyzing with AI...' : 'Analyze Match for TUM Informatics'}
        </button>
      )}

      {analysis && (
        <div className="bg-gray-100 p-6 rounded-lg whitespace-pre-wrap">
          <h2 className="text-xl font-bold mb-4">Analysis Results</h2>
          {analysis}
        </div>
      )}
    </main>
  );
}