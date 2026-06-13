import React, { useRef } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { exportAllData, importAllData, clearAllData } from '../db/backup';
import { Download, Upload, RefreshCw, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        await importAllData(jsonData);
      } catch (err) {
        alert('Invalid JSON file format: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="page animate-fade-in flex flex-col gap-6">
      <div className="page-header">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-accent" />
          System Settings
        </h1>
        <p className="text-sm text-secondary">Manage backups, data exports, and configurations for KGOS 2031.</p>
      </div>

      <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {/* Backup & Restore */}
        <Card header={<span className="card-title">Data Administration</span>}>
          <p className="text-sm text-secondary mb-4 leading-relaxed">
            KGOS 2031 stores all formulation, CRM, and vital metrics locally inside IndexedDB. Use these tools to back up or restore your environment.
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="primary" icon={Download} onClick={exportAllData}>
              Export Backup (JSON)
            </Button>
            
            <Button variant="secondary" icon={Upload} onClick={handleImportClick}>
              Import Backup File
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            
            <div className="divider" />
            
            <Button variant="danger" icon={RefreshCw} onClick={clearAllData}>
              Factory Reset Database
            </Button>
          </div>
        </Card>

        {/* System Info */}
        <Card header={<span className="card-title">Product Details</span>}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl text-white"
                style={{ background: 'var(--accent-gradient)' }}
              >
                KG
              </div>
              <div>
                <h4 className="font-semibold text-primary">KGOS (Kumar Gourav Operating System)</h4>
                <p className="text-xs text-muted">Version 2031.1.0-gold</p>
              </div>
            </div>
            
            <div className="divider" />

            <div className="text-sm text-secondary leading-relaxed">
              Designed as a unified Command Center incorporating Personal ERP, B2B CRM, Food Ingredients Formulation logs, and strategic execution modules. Powered by Dexie.js local storage and Vite + React.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
