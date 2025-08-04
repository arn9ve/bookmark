"use client";

import { useState, useEffect, useRef } from "react";
import ProfileInput from "./components/ProfileInput";
import ResultsDisplay from "./components/ResultsDisplay";
import ResultsTable from "./components/ResultsTable";
import type { ScrapedData } from "@/src/types";
import { saveData, loadData } from "./services/storage";

interface DataManagementProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownload: () => void;
  onUpdateGeocodes: () => void;
  disabled: boolean;
  isGeocoding: boolean;
}

const DataManagement = ({ onFileUpload, onDownload, onUpdateGeocodes, disabled, isGeocoding }: DataManagementProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <button 
        className="btn btn-secondary hover-lift" 
        onClick={handleUploadClick}
        disabled={disabled}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Carica Dati
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileUpload}
        className="hidden"
        accept=".json"
      />
      <button 
        className="btn btn-primary hover-lift" 
        onClick={onDownload} 
        disabled={disabled}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Scarica Dati
      </button>
      <button 
        className="btn btn-warning hover-lift" 
        onClick={onUpdateGeocodes}
        disabled={disabled}
      >
        {isGeocoding ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            Aggiornando...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Aggiorna Coordinate
          </>
        )}
      </button>
    </div>
  );
};


export default function Home() {
  const [scrapedData, setScrapedData] = useState<ScrapedData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);
  const [keywords, setKeywords] = useState("");
  const [sortOrder, setSortOrder] = useState('engagement');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState('card');

  useEffect(() => {
    const data = loadData();
    setScrapedData(data);
    const storedFavorites = JSON.parse(localStorage.getItem('sichef_favorites') || '[]');
    setFavorites(storedFavorites);
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prevFavorites => {
      const newFavorites = prevFavorites.includes(id)
        ? prevFavorites.filter(favId => favId !== id)
        : [...prevFavorites, id];
      localStorage.setItem('sichef_favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const handleScrape = async (url: string) => {
    setIsLoading(true);
    setScrapedData([]); // Clear previous results
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, limit, keywords }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data: ScrapedData[] = await response.json();
      setScrapedData(data);
      saveData(data);
    } catch (error) {
      console.error("Scraping failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (scrapedData.length === 0) {
      alert("Nessun dato da scaricare.");
      return;
    }
    const jsonString = JSON.stringify(scrapedData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sichef_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("Il file non è in formato testo.");
        }
        const data = JSON.parse(text);
        
        if (Array.isArray(data) && data.every(item => 'id' in item && 'videoUrl' in item)) {
          setScrapedData(data);
          saveData(data);
          alert("Dati caricati con successo!");
        } else {
          throw new Error("Il file JSON non ha la struttura dati attesa.");
        }

      } catch (error) {
        console.error("Errore nel caricare o parsare il file:", error);
        const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto";
        alert(`Errore nel caricamento del file: ${errorMessage}`);
      }
    };
    reader.readAsText(file);
  };
  
  const handleUpdateGeocodes = async () => {
    const itemsToUpdate = scrapedData.filter(
      (item) => item.analysis && !item.analysis.latitude
    );

    if (itemsToUpdate.length === 0) {
      alert("Tutti i dati sono già geolocalizzati.");
      return;
    }

    setIsGeocoding(true);
    let updatedCount = 0;

    const updatedData = [...scrapedData];

    for (const item of itemsToUpdate) {
      if (!item.analysis) continue;

      try {
        const response = await fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurantName: item.analysis.restaurantName,
            restaurantLocation: item.analysis.restaurantLocation,
          }),
        });

        if (response.ok) {
          const geocodeResult = await response.json();
          const itemIndex = updatedData.findIndex(d => d.id === item.id);
          if (itemIndex !== -1 && updatedData[itemIndex] && updatedData[itemIndex].analysis) {
             updatedData[itemIndex].analysis!.latitude = geocodeResult.latitude;
             updatedData[itemIndex].analysis!.longitude = geocodeResult.longitude;
             updatedData[itemIndex].analysis!.formattedAddress = geocodeResult.formattedAddress;
             updatedCount++;
          }
        } else {
           console.warn(`Geocoding fallito per ${item.analysis.restaurantName}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Errore durante la chiamata API di geocoding per ${item.analysis.restaurantName}:`, error);
      }
    }

    setScrapedData(updatedData);
    saveData(updatedData);
    setIsGeocoding(false);
    alert(`Aggiornamento completato! ${updatedCount} su ${itemsToUpdate.length} elementi sono stati geolocalizzati.`);
  };

  const sortedData = [...scrapedData]
    .filter(item => {
      if (!item.analysis) return false;
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      
      return (
        (item.analysis.restaurantName && item.analysis.restaurantName.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (item.analysis.dishDescription && item.analysis.dishDescription.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (item.analysis.restaurantLocation && item.analysis.restaurantLocation.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (item.caption && item.caption.toLowerCase().includes(lowerCaseSearchTerm))
      );
    })
    .sort((a, b) => {
      // Algoritmo intelligente: privilegi salvataggi e condivisioni
      // Salvataggi x5 (indicano vera intenzione di visita)
      // Condivisioni x4 (simile ai salvataggi)  
      // Like x1 (indicano viralità ma meno intenzione)
      const getSmartEngagementScore = (item: ScrapedData) => {
        const likes = item.likes || 0;
        const saves = item.saves || 0; 
        const shares = item.shares || 0;
        
        // Algoritmo intelligente che considera l'intenzione di visita
        return likes + (saves * 5) + (shares * 4);
      };
      
      switch (sortOrder) {
        case 'engagement':
          return getSmartEngagementScore(b) - getSmartEngagementScore(a);
        case 'likes':
          return (b.likes || 0) - (a.likes || 0);
        case 'saves':
          return (b.saves || 0) - (a.saves || 0);
        case 'shares':
          return (b.shares || 0) - (a.shares || 0);
        default:
          return 0;
      }
    });

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-primary-light relative overflow-hidden">
        <div className="noise-background"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="heading-1 text-5xl font-bold text-primary-dark mb-4">
              SiChef
            </h1>
            <p className="body-text text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              Inserisci l'URL di un profilo TikTok per scoprire i ristoranti che ha recensito.
            </p>
            
            {/* Form principale in hero */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
              <ProfileInput onScrape={handleScrape} isLoading={isLoading} />
              
              {/* Controlli avanzati */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <div className="flex-1">
                  <label htmlFor="keywords" className="label-text mb-2">Parole chiave (opzionale)</label>
                  <input
                    type="text"
                    id="keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="es. gnocchi, sushi vegan"
                    className="input-field"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="limit" className="label-text mb-2">N. video da analizzare</label>
                  <select
                    id="limit"
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="input-field"
                    disabled={isLoading}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={40}>40</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">

        {/* Data Management Section */}
        <div className="mb-8">
          <div className="bg-surface border border-border rounded-xl p-6 shadow">
            <h3 className="heading-3 text-center text-text-primary mb-4">Gestione Dati</h3>
            <DataManagement 
              onFileUpload={handleFileUpload}
              onDownload={handleDownload}
              onUpdateGeocodes={handleUpdateGeocodes}
              disabled={isLoading || isGeocoding}
              isGeocoding={isGeocoding}
            />
          </div>
        </div>

        {scrapedData.length > 0 && (
          <div className="mb-8">
            <div className="bg-surface border border-border rounded-xl p-6 shadow">
              <h3 className="heading-3 text-text-primary mb-6">Risultati ({sortedData.length})</h3>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Cerca per nome, piatto o luogo..."
                    className="input-field"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <select 
                    className="input-field min-w-[200px]"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="engagement">Classifica Intelligente</option>
                    <option value="likes">Per Like</option>
                    <option value="saves">Per Salvataggi</option>
                    <option value="shares">Per Condivisioni</option>
                  </select>
                  
                  {/* View Mode Toggle */}
                  <div className="flex border border-border rounded-lg bg-surface-secondary p-1">
                    <button 
                      className={`btn-sm px-4 py-2 rounded-md transition-all ${
                        viewMode === 'card' 
                          ? 'bg-primary text-primary-dark shadow-sm' 
                          : 'text-text-tertiary hover:text-text-secondary hover:bg-surface'
                      }`}
                      onClick={() => setViewMode('card')}
                    >
                      Card
                    </button>
                    <button 
                      className={`btn-sm px-4 py-2 rounded-md transition-all ${
                        viewMode === 'table' 
                          ? 'bg-primary text-primary-dark shadow-sm' 
                          : 'text-text-tertiary hover:text-text-secondary hover:bg-surface'
                      }`}
                      onClick={() => setViewMode('table')}
                    >
                      Tabella
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-16">
            <div className="bg-surface border border-border rounded-xl p-8 shadow max-w-md mx-auto">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-light rounded-full mb-4">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <h3 className="heading-3 text-text-primary mb-2">Analizzando i video</h3>
              <p className="body-text text-text-secondary">Potrebbe richiedere qualche minuto...</p>
            </div>
          </div>
        ) : (
          viewMode === 'card' ? (
            <ResultsDisplay 
              data={sortedData} 
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          ) : (
            <ResultsTable
              data={sortedData}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          )
        )}
      </div>
    </main>
  );
}
