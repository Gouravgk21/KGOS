import React, { useRef, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { exportAllData, importAllData, clearAllData } from '../db/backup';
import { pushToCloud, pullFromCloud } from '../db/syncService';
import { Download, Upload, RefreshCw, Settings as SettingsIcon, CloudLightning, CloudDownload } from 'lucide-react';

export default function Settings() {
  const fileInputRef = useRef(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

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

  const handlePush = async () => {
    setSyncing(true);
    setSyncStatus('Pushing to cloud...');
    const res = await pushToCloud();
    setSyncing(false);
    if (res.success) {
      setSyncStatus('Synced successfully!');
      setTimeout(() => setSyncStatus(''), 3000);
    } else {
      setSyncStatus(`Push failed: ${res.error}`);
    }
  };

  const handlePull = async () => {
    if (!window.confirm('Pulling from cloud will overwrite local entries. Proceed?')) return;
    setSyncing(true);
    setSyncStatus('Pulling from cloud...');
    const res = await pullFromCloud();
    setSyncing(false);
    if (res.success) {
      setSyncStatus('Pulled successfully! Reloading...');
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setSyncStatus(`Pull failed: ${res.error}`);
    }
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
            KGOS 2031 stores all formulation, CRM, and vital metrics locally inside IndexedDB. Use these tools to back up, restore, or sync with Supabase Cloud.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Button variant="primary" icon={CloudLightning} onClick={handlePush} disabled={syncing} className="flex-1">
                Sync to Cloud
              </Button>
              <Button variant="secondary" icon={CloudDownload} onClick={handlePull} disabled={syncing} className="flex-1">
                Pull from Cloud
              </Button>
            </div>
            {syncStatus && <div className="text-xs font-semibold text-accent text-center py-1">{syncStatus}</div>}
            
            <div className="divider" />
            
            <Button variant="secondary" icon={Download} onClick={exportAllData}>
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
