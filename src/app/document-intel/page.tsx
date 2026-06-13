'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { FileText, Upload, CheckCircle, AlertTriangle, User, Calendar, Sparkles } from 'lucide-react';

interface ExtractedData {
  summary: string;
  tasks: string[];
  deadlines: string[];
  opportunities: string[];
  risks: string[];
  contacts: string[];
}

export default function DocumentIntelPage() {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);

  const handleUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileUploaded(true);
    setExtracting(true);

    // Mock extraction process
    setTimeout(() => {
      setExtracting(false);
      setExtracted({
        summary: "Formulation specification sheet outlining viscosity metrics and trial batch conditions for Carrageenan blend stabilizer systems.",
        tasks: [
          "Prepare 500g prototype blend (Ratio 70:30 Kappa to Locust Bean Gum)",
          "Log formulation gel strength metrics"
        ],
        deadlines: [
          "Submit trial feedback to client by June 28, 2026"
        ],
        opportunities: [
          "Substitute import pectin with custom blends to boost margin by 12%"
        ],
        risks: [
          "High moisture content in seaweed feedstock could degrade gel properties"
        ],
        contacts: [
          "Dr. Ramesh Kumar (R&D Director) - ramesh.k@heritage.com"
        ]
      });
    }, 1500);
  };

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-500" />
          Document Intelligence Center
        </h1>
        <p className="text-sm text-zinc-400">Upload technical specifications, purchase orders, or exam guides to extract metadata automatically.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <div className="flex flex-col gap-6">
          <Card header={<span className="text-zinc-200 font-semibold">File Upload</span>}>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl p-8 bg-zinc-950/20 hover:border-zinc-700 transition-colors">
              <Upload className="w-8 h-8 text-zinc-500 mb-3" />
              <p className="text-xs text-zinc-400 text-center mb-4">Support PDF, DOCX, XLSX, CSV formats</p>
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors">
                Select File
                <input type="file" onChange={handleUploadMock} className="hidden" accept=".pdf,.docx,.xlsx,.csv" />
              </label>
            </div>

            {fileUploaded && (
              <div className="mt-4 p-3 border border-zinc-850 rounded-lg bg-zinc-950/40 text-xs text-zinc-400">
                Uploaded: <strong className="text-zinc-200">{fileName}</strong>
              </div>
            )}
          </Card>
        </div>

        {/* Extraction Results */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {extracting ? (
            <Card>
              <div className="flex flex-col items-center justify-center p-12 gap-4">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                <p className="text-sm text-zinc-500 font-medium">Extracting metadata & parsing file elements...</p>
              </div>
            </Card>
          ) : extracted ? (
            <Card header={<span className="text-zinc-200 font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-400" /> Extracted Insights</span>}>
              <div className="flex flex-col gap-5 text-xs text-zinc-350">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Executive Summary</span>
                  <p className="leading-relaxed bg-zinc-900/20 p-3 rounded-lg border border-zinc-850">{extracted.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tasks */}
                  <div className="p-3.5 border border-zinc-800 rounded-lg bg-zinc-900/10">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-2 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-blue-400" /> Tasks</span>
                    <ul className="flex flex-col gap-1.5 list-disc pl-4 text-zinc-400">
                      {extracted.tasks.map((task, i) => <li key={i}>{task}</li>)}
                    </ul>
                  </div>

                  {/* Deadlines */}
                  <div className="p-3.5 border border-zinc-800 rounded-lg bg-zinc-900/10">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-2 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-amber-400" /> Deadlines</span>
                    <ul className="flex flex-col gap-1.5 list-disc pl-4 text-zinc-400">
                      {extracted.deadlines.map((dl, i) => <li key={i}>{dl}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Opportunities */}
                  <div className="p-3.5 border border-zinc-800 rounded-lg bg-zinc-900/10">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-2 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Opportunities</span>
                    <ul className="flex flex-col gap-1.5 list-disc pl-4 text-zinc-400">
                      {extracted.opportunities.map((opp, i) => <li key={i}>{opp}</li>)}
                    </ul>
                  </div>

                  {/* Risks */}
                  <div className="p-3.5 border border-zinc-800 rounded-lg bg-zinc-900/10">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-2 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Risks</span>
                    <ul className="flex flex-col gap-1.5 list-disc pl-4 text-zinc-400">
                      {extracted.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Contacts */}
                <div className="p-3.5 border border-zinc-800 rounded-lg bg-zinc-900/10">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-2 flex items-center gap-1"><User className="w-3.5 h-3.5 text-purple-400" /> Contacts</span>
                  <ul className="flex flex-col gap-1.5 list-disc pl-4 text-zinc-400">
                    {extracted.contacts.map((contact, i) => <li key={i}>{contact}</li>)}
                  </ul>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="p-12 text-center text-sm text-zinc-500">
                Upload a document to review extracted metadata.
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
