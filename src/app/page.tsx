"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, FileDown, X, Heart, Trash2, UploadCloud, DownloadCloud, Search, Globe2 } from "lucide-react";
import { Select } from '@base-ui-components/react/select';

const PRIORITY_ITEMS: Record<string, string> = {
  all: 'Tutte',
  'must-visit': 'Must have',
  recommended: 'Consigliati',
  'if-in-area': 'In zona',
};
import ProfileInput from "./components/ProfileInput";
import ResultsDisplay from "./components/ResultsDisplay";
import ResultsTable from "./components/ResultsTable";
import Map from "./components/Map/Map";
import { ClassificationStats } from "./components/ClassificationStats";
import type { ScrapedData } from "@/src/types";
import { saveData, loadData } from "./services/storage";
import { classifyRestaurant } from "@/src/lib/scraping/classification";

interface DataManagementProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownload: () => void;
  onUpdateGeocodes: () => void;
  disabled: boolean;
  isGeocoding: boolean;
  variant?: 'solid' | 'tertiary';
  layout?: 'buttons' | 'cards';
  enrichOnExport?: boolean;
  onToggleEnrich?: (value: boolean) => void;
}

  const DataManagement = ({ onFileUpload, onDownload, onUpdateGeocodes, disabled, isGeocoding, variant = 'solid', layout = 'buttons', enrichOnExport, onToggleEnrich }: DataManagementProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

    const uploadBtnCls = variant === 'tertiary' ? 'btn btn-ghost btn-sm' : 'btn btn-secondary btn-sm hover-lift';
    const downloadBtnCls = variant === 'tertiary' ? 'btn btn-ghost btn-sm' : 'btn btn-primary btn-sm hover-lift';
    const geocodeBtnCls = variant === 'tertiary' ? 'btn btn-ghost btn-sm' : 'btn btn-warning btn-sm hover-lift';

    if (layout === 'cards') {
      return (
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-surface-secondary border border-border rounded-xl p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="heading-5">File JSON</h4>
                <p className="small-text text-text-tertiary">Carica un dataset o scarica i risultati correnti.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className={uploadBtnCls} onClick={handleUploadClick} disabled={disabled}>
                <UploadCloud className="w-4 h-4" />
                <span className="ml-1">Carica</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={onFileUpload} className="hidden" accept=".json" />
              <button className={downloadBtnCls} onClick={onDownload} disabled={disabled}>
                <DownloadCloud className="w-4 h-4" />
                <span className="ml-1">Scarica</span>
              </button>
            </div>
          </div>

          <div className="bg-surface-secondary border border-border rounded-xl p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="heading-5">Geocoding</h4>
                <p className="small-text text-text-tertiary">Completa le coordinate mancanti e gli indirizzi.</p>
              </div>
            </div>
            <button className={geocodeBtnCls} onClick={onUpdateGeocodes} disabled={disabled}>
              {isGeocoding ? (
                <>
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-1">Aggiornando…</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  <span className="ml-1">Aggiorna geocoding</span>
                </>
              )}
            </button>
            {typeof enrichOnExport === 'boolean' && onToggleEnrich && (
              <label className="flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  checked={enrichOnExport}
                  onChange={(e) => onToggleEnrich(e.target.checked)}
                />
                <span className="small-text text-text-tertiary">Arricchisci descrizioni all'esportazione</span>
              </label>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-3">
        <button 
          className={uploadBtnCls}
        onClick={handleUploadClick}
        disabled={disabled}
      >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileUpload}
        className="hidden"
        accept=".json"
      />
        <button 
          className={downloadBtnCls}
        onClick={onDownload} 
        disabled={disabled}
      >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      
      </button>
        <button 
          className={geocodeBtnCls}
        onClick={onUpdateGeocodes}
        disabled={disabled}
      >
        {isGeocoding ? (
          <>
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            Aggiornando...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          
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
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'must-visit' | 'recommended' | 'if-in-area'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState('map');
  const [searchMode, setSearchMode] = useState<'profile' | 'single-video' | 'data'>('profile');
  const [selectedOnMap, setSelectedOnMap] = useState<ScrapedData | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [enrichOnExport, setEnrichOnExport] = useState<boolean>(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const [isEnriching, setIsEnriching] = useState<boolean>(false);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const data = loadData();
    // All'avvio, nessun elemento è "Nuovo" finché non si aggiunge altro
    setScrapedData(Array.isArray(data) ? data.map(d => ({ ...d, isNew: false })) : []);
    const storedFavorites = JSON.parse(localStorage.getItem('bookmark_favorites') || '[]');
    setFavorites(storedFavorites);
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prevFavorites => {
      const newFavorites = prevFavorites.includes(id)
        ? prevFavorites.filter(favId => favId !== id)
        : [...prevFavorites, id];
      localStorage.setItem('bookmark_favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const removeItem = (id: string) => {
    setScrapedData(prev => {
      const filtered = prev.filter(item => item.id !== id);
      saveData(filtered);
      return filtered;
    });
    setFavorites(prev => prev.filter(f => f !== id));
    setSelectedIds(prev => prev.filter(s => s !== id));
    setSelectedOnMap(curr => (curr?.id === id ? null : curr));
  };

  const handleScrape = async (url: string) => {
    setIsLoading(true);
    // Non cancellare i risultati precedenti: si accumulano
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, limit: searchMode === 'profile' ? limit : 1, keywords }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data: ScrapedData[] = await response.json();
      // Marca i nuovi elementi che verranno aggiunti
      const incoming = data.map(d => ({ ...d, isNew: true as const }));
      // Append, azzera il flag "Nuovo" ai precedenti e deduplica preferendo i nuovi
      setScrapedData(prev => {
        const prevWithoutNew = prev.map(item => ({ ...item, isNew: false }));
        const merged = [...prevWithoutNew, ...incoming];
        // Deduplica per nome+posizione, preferendo gli elementi più recenti (incoming)
        const byKey = new globalThis.Map<string, ScrapedData>();
        for (let i = merged.length - 1; i >= 0; i -= 1) {
          const item = merged[i]!;
          const key = `${item.analysis?.restaurantName || ''}__${item.analysis?.restaurantLocation || ''}`.toLowerCase();
          if (!byKey.has(key)) byKey.set(key, item);
        }
        const deduped: ScrapedData[] = Array.from(byKey.values());
        // I nuovi vanno in cima
        deduped.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        saveData(deduped);
        return deduped;
      });
      setViewMode('map');
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
    a.download = "bookmark_data.json";
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
      
      const matchesQuery = (
        (item.analysis.restaurantName && item.analysis.restaurantName.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (item.analysis.dishDescription && item.analysis.dishDescription.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (item.analysis.restaurantLocation && item.analysis.restaurantLocation.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (item.caption && item.caption.toLowerCase().includes(lowerCaseSearchTerm))
      );

      if (!matchesQuery) return false;

      if (showOnlyFavorites && !favorites.includes(item.id)) return false;

      if (priorityFilter === 'all') return true;
      const analysis = item.analysis.priority ? item.analysis : classifyRestaurant(item.analysis);
      return analysis.priority === priorityFilter;
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

  useEffect(() => {
    if (selectedOnMap?.id) {
      const el = itemRefs.current[selectedOnMap.id];
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedOnMap]);

  const renderContent = () => {
    if (isLoading) {
      return (
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
      );
    }

    switch (viewMode) {
      case 'card':
        return (
          <ResultsDisplay 
            data={sortedData} 
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'table':
        return (
          <ResultsTable
            data={sortedData}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'map':
        return <Map data={sortedData} />;
      default:
        return null;
    }
  };

  // Helpers per selezione/itinerario
  const isSelected = (id: string) => selectedIds.includes(id);
  const toggleSelected = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const selectAllVisible = () => {
    const ids = sortedData.map(d => d.id);
    setSelectedIds(ids);
  };
  const clearSelection = () => setSelectedIds([]);

  const getMapsQueryForItem = (item: ScrapedData) => {
    const a = item.analysis;
    if (!a) return '';
    if (a.latitude !== undefined && a.longitude !== undefined) return `${a.latitude},${a.longitude}`;
    if (a.formattedAddress) return a.formattedAddress;
    return `${a.restaurantName} ${a.restaurantLocation}`;
  };

  const openGoogleMapsItinerary = () => {
    const items = sortedData.filter(d => selectedIds.includes(d.id));
    if (items.length === 0) {
      alert('Seleziona almeno un elemento.');
      return;
    }
    const queries = items.map(getMapsQueryForItem).filter((q): q is string => Boolean(q));
    if (queries.length === 0) {
      alert('Gli elementi selezionati non hanno indirizzi validi.');
      return;
    }
    const destination: string = queries[queries.length - 1] as string;
    const waypoints: string = queries.slice(0, -1).join('|');
    const url = waypoints
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(waypoints)}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    window.open(url, '_blank');
  };

  const exportSelectionToPdf = () => {
    const items = sortedData.filter(d => selectedIds.includes(d.id));
    if (items.length === 0) {
      alert('Seleziona almeno un elemento.');
      return;
    }
    const buildAndOpen = (descriptions: Record<string, string> = {}) => {
      const htmlRows = items.map((item, idx) => {
        const a = item.analysis;
        const title = a?.restaurantName || 'Senza nome';
        const addr = a?.formattedAddress || a?.restaurantLocation || '';
        const dish = a?.dishDescription || '';
        const extra = descriptions[item.id] ? `<div style="margin-top:4px;color:#555;">${descriptions[item.id]}</div>` : '';
        return `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;vertical-align:top;">${idx + 1}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;vertical-align:top;">${title}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;vertical-align:top;">${addr}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;vertical-align:top;">${dish}${extra}</td>
        </tr>`;
      }).join('');

      const popup = window.open('', '_blank');
      if (!popup) return;
      popup.document.write(`<!doctype html><html><head><meta charset="utf-8" />
        <title>Itinerario</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding:24px; }
          h1 { font-size:20px; margin-bottom:12px; }
          table { width:100%; border-collapse:collapse; }
          th { text-align:left; padding:8px; border-bottom:2px solid #333; }
        </style>
      </head><body>
        <h1>Itinerario selezionato (${items.length} luoghi)</h1>
        <table>
          <thead><tr><th>#</th><th>Ristorante</th><th>Indirizzo</th><th>Piatto</th></tr></thead>
          <tbody>${htmlRows}</tbody>
        </table>
        <script>window.print();</script>
      </body></html>`);
      popup.document.close();
    };

    if (!enrichOnExport) {
      buildAndOpen();
      return;
    }

    setIsEnriching(true);
    enrichPlaces(items).then((descriptions) => {
      buildAndOpen(descriptions);
    }).finally(() => setIsEnriching(false));
  };

  // Chiudi il menu export al click esterno
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    if (isExportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExportMenuOpen]);

  async function enrichPlaces(items: ScrapedData[]): Promise<Record<string, string>> {
    try {
      const payload = items.map((it) => ({
        id: it.id,
        name: it.analysis?.restaurantName || '',
        address: it.analysis?.formattedAddress || it.analysis?.restaurantLocation || '',
        dish: it.analysis?.dishDescription || '',
        city: (it.analysis?.restaurantLocation || '').split(',')[0] || ''
      }));
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload })
      });
      if (!res.ok) return {};
      const data = await res.json() as { descriptions?: Record<string, string> };
      return data.descriptions || {};
    } catch {
      return {};
    }
  }

  const exportSelectionToKml = () => {
    const items = sortedData.filter(d => selectedIds.includes(d.id));
    if (items.length === 0) {
      alert('Seleziona almeno un elemento.');
      return;
    }

    const escapeXml = (str: string) => str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const buildAndDownload = (descriptions: Record<string, string> = {}) => {
      const placemarks = items.map((item) => {
        const a = item.analysis;
        const name = escapeXml(a?.restaurantName || 'Senza nome');
        const address = escapeXml(a?.formattedAddress || a?.restaurantLocation || '');
        const dish = escapeXml(a?.dishDescription || '');
        const video = escapeXml(item.videoUrl || '');
        const extraDesc = descriptions[item.id] ?? '';
        const extra = extraDesc ? `<p>${escapeXml(extraDesc)}</p>` : '';

        const descriptionParts = [
          extra,
          dish ? `<p><strong>Piatto:</strong> ${dish}</p>` : '',
          address ? `<p><strong>Indirizzo:</strong> ${address}</p>` : '',
          video ? `<p><a href=\"${video}\" target=\"_blank\" rel=\"noopener\">Video</a></p>` : '',
        ].filter(Boolean).join('');

        const description = descriptionParts
          ? `<![CDATA[${descriptionParts}]]>`
          : '';

        const hasCoords = a && typeof a.latitude === 'number' && typeof a.longitude === 'number';
        const point = hasCoords
          ? `<Point><coordinates>${a!.longitude},${a!.latitude},0</coordinates></Point>`
          : '';

        const addressTag = !hasCoords && address ? `<address>${address}</address>` : '';

        return `
          <Placemark>
            <name>${name}</name>
            ${description ? `<description>${description}</description>` : ''}
            ${addressTag}
            ${point}
          </Placemark>`;
      }).join('\\n');

      const kml = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<kml xmlns=\"http://www.opengis.net/kml/2.2\" xmlns:gx=\"http://www.google.com/kml/ext/2.2\">
  <Document>
    <name>Bookmark - Luoghi selezionati (${items.length})</name>
    <Folder>
      <name>Luoghi</name>
      ${placemarks}
    </Folder>
  </Document>
</kml>`;

      const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bookmark_map.kml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    if (!enrichOnExport) {
      buildAndDownload();
      return;
    }

    setIsEnriching(true);
    enrichPlaces(items).then((descriptions) => {
      buildAndDownload(descriptions);
    }).finally(() => setIsEnriching(false));
  };

  return (
    <main className="min-h-screen">
      <div className="fixed inset-0 z-0">
        <Map data={sortedData} onSelect={setSelectedOnMap} selectedItem={selectedOnMap} />
      </div>

      {/* Sidebar sinistra fissa sopra la mappa */}
      <aside className="fixed left-4 top-4 bottom-4 z-10 w-[350px] max-w-[92vw] bg-surface border border-border rounded-md flex flex-col shadow-none">
        
        <div className="p-0  overflow-y-auto flex flex-col gap-2 " >
          {/* Modalità e input URL */}

          <div className="p-0"> 
          <div className="flex flex-col gap-3 flex-1 p-4 border-b border-border">

            <div className="flex items-center justify-between">
           
              <div className="tab-group w-full">
                <button 
                  className={`tab-btn ${searchMode === 'profile' ? 'is-active' : ''}`}
                  onClick={() => setSearchMode('profile')}
                >Profilo</button>
                <button 
                  className={`tab-btn ${searchMode === 'single-video' ? 'is-active' : ''}`}
                  onClick={() => setSearchMode('single-video')}
                >Video</button>
                <button 
                  className={`tab-btn ${searchMode === 'data' ? 'is-active' : ''}`}
                  onClick={() => setSearchMode('data')}
                >Dati</button>
              </div>
              
            </div>
            {searchMode !== 'data' && (
              <ProfileInput onScrape={handleScrape} isLoading={isLoading} />
            )}


          {/* Controlli avanzati + Gestione dati */}
          {searchMode === 'data' && (
            <div className="">
              <DataManagement 
                onFileUpload={handleFileUpload}
                onDownload={handleDownload}
                onUpdateGeocodes={handleUpdateGeocodes}
                disabled={isLoading || isGeocoding}
                isGeocoding={isGeocoding}
                variant="tertiary"
                layout="cards"
                enrichOnExport={enrichOnExport}
                onToggleEnrich={setEnrichOnExport}
              />
            </div>
          )}

            {searchMode !== 'data' && (
              <div className={searchMode === 'profile' ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-1 gap-2'}>
                <div className="flex flex-col gap-1">
                  <label htmlFor="keywords" className="heading-5">Parole chiave</label>
                  <input
                    type="text"
                    id="keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="es. gnocchi, sushi vegan"
                    className="input-field input-field-sm"
                    disabled={isLoading}
                  />
                </div>

                {searchMode === 'profile' && (
                  <div className="flex flex-col gap-1">
                    <label htmlFor="limit" className=" heading-5">N. video</label>
                    <select
                      id="limit"
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="input-field input-field-sm" 
                      disabled={isLoading}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value={40}>40</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          
          </div>
          </div>



          {/* Sezione mini-tabella risultati e controlli */}
          <div className="border-border p-3 flex flex-col gap-3">
            <div className="flex items-center justify-between ">
              <h4 className="heading-5">Risultati ({sortedData.length})</h4>

          
              
            </div>
            {/* Controlli sticky */}
            <div className="sticky top-3 z-10 bg-surface p-2 rounded-2xl border border-border flex gap-2 items-center">
              <input
                type="text"
                placeholder="Cerca..."
                className="input-field input-field-sm w-2/5" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

                <Select.Root
                  items={PRIORITY_ITEMS}
                  value={priorityFilter}
                  onValueChange={(v) => setPriorityFilter(v as any)}
                >
                  <Select.Trigger className="input-field input-field-sm flex items-center justify-between px-3">
                    <Select.Value />
                    <Select.Icon>
                      <svg className="w-4 h-4 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Positioner>
                    <Select.Popup className="bg-surface-secondary border border-border rounded-xl shadow-sm z-50 max-h-56 overflow-auto">
                      {Object.entries(PRIORITY_ITEMS).map(([value, label]) => (
                        <Select.Item key={value} value={value} className="px-4 py-2 hover:border-1 !border-black  cursor-pointer flex items-center justify-between">
                          <span>{label}</span>
                          {priorityFilter === value && (
                            <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </Select.Item>
                      ))}
                    </Select.Popup>
                  </Select.Positioner>
                </Select.Root>

              <button
                type="button"
                className={`btn-icon-button btn-sm btn-fav !w-14 rounded-lg ${showOnlyFavorites ? 'is-active' : ''}`}
                title={showOnlyFavorites ? 'Mostra tutti' : 'Mostra solo salvati'}
                onClick={() => setShowOnlyFavorites(v => !v)}
              >
                <Heart size={16} fill={showOnlyFavorites ? 'currentColor' : 'none'} />
              </button>
                
              
            
           
            </div>
            {/* Lista compatta risultati */}
            <div className="flex-1 p-2 overflow-auto scrollbar-thin scrollbar-thumb-primary-light scrollbar-track-transparent">
              {sortedData.map((item) => (
                <div
                  key={item.id}
                  ref={(el) => { itemRefs.current[item.id] = el; }}
                  className={`justify-between group flex items- gap-2 p-2 rounded-md cursor-pointer transition-colors hover:bg-surface-secondary ${isSelected(item.id) ? 'bg-surface-secondary' : ''} ${selectedOnMap?.id === item.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedOnMap(item)}
                >
                  <input
                    type="checkbox"
                    className="accent-primary mr-1"
                    checked={isSelected(item.id)}
                    onChange={(e) => { e.stopPropagation(); toggleSelected(item.id); }}
                  />
                  <div className="min-w-0 w-full">
                    <div className="flex items-center gap-2">
                      <p className="body-text truncate">{item.analysis?.restaurantName || 'Senza nome'}</p>
                      {item.isNew && (
                        <span className="text-[10px] uppercase tracking-wide bg-success text-black px-2 py-0.5 rounded-full">Nuovo</span>
                      )}
                    </div>
                    <p className="small-text text-text-tertiary truncate">{item.analysis?.restaurantLocation}</p>
                  </div>
                  <button
                    className={`btn-icon-button btn-sm btn-fav opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${favorites.includes(item.id) ? 'is-active' : ''}`}
                    title={favorites.includes(item.id) ? 'Rimuovi dai salvati' : 'Salva'}
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                  >
                    <Heart size={14} fill={favorites.includes(item.id) ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    className="btn-icon-button btn-sm btn-delete opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Elimina"
                    onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                


              ))}
              {sortedData.length === 0 && (
                <p className="small-text text-text-tertiary px-3 py-4">Nessun risultato.</p>
              )}
            </div>

          </div>

          {/* Footer azioni sticky */}
          <div className="mt-auto sticky bottom-0 p-4 border-t border-border bg-surface">
            <div className="flex gap-2">
              <div className="relative flex-1" ref={exportMenuRef}>
                <button className="btn btn-sm btn-primary w-full" onClick={() => setIsExportMenuOpen(v => !v)}>
                  <span className="inline-flex items-center"><MapPin size={18} className="mr-2"/>Mappe</span>
                </button>
                {isExportMenuOpen && (
                  <div className="absolute bottom-12 left-0 right-0 bg-surface border border-border rounded-xl shadow p-2 z-20">
                    <button className="btn btn-sm btn-secondary btn-full mb-2" onClick={() => { setIsExportMenuOpen(false); openGoogleMapsItinerary(); }}>
                      Apri itinerario su Maps
                    </button>
                    <button className="btn btn-sm btn-secondary btn-full" onClick={() => { setIsExportMenuOpen(false); exportSelectionToKml(); }}>
                      Esporta KML per Google Earth/Maps
                    </button>
                  </div>
                )}
              </div>
              <button className="btn btn-sm btn-secondary flex-1" onClick={exportSelectionToPdf}>
                <span className="inline-flex items-center"><FileDown size={18} className="mr-2"/>PDF</span>
              </button>
            </div>
          </div>

        </div>

      </aside>

      {/* Sidebar destra fissa sopra la mappa */}
      <aside className={`fixed right-4 top-4 bottom-4 z-10 w-[350px] max-w-[92vw] bg-surface border border-border rounded-xl shadow flex flex-col  ${selectedOnMap ? 'block' : 'hidden'}`}>
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h3 className="heading-4">Dettagli</h3>
          {!selectedOnMap && (
            <p className="text-text-tertiary small-text mt-1">Clicca un marker sulla mappa o un elemento nella lista per vedere i dettagli completi.</p>
          )}

          <button className="btn btn-sm btn-secondary !p-2 w-8 h-8" onClick={() => setSelectedOnMap(null)}>
            <X size={16} className=""/>
          </button>
        </div>
        <div className="p-3 overflow-y-auto">
          {selectedOnMap && selectedOnMap.analysis && (
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="heading-5">{selectedOnMap.analysis.restaurantName}</p>
                  {selectedOnMap.analysis.formattedAddress && (
                    <p className="small-text text-text-tertiary">{selectedOnMap.analysis.formattedAddress}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedOnMap.analysis.isPorkSpecialist && <span className="text-xs">🐷</span>}
                  <button
                    className={`btn-icon-button btn-sm btn-fav ${favorites.includes(selectedOnMap.id) ? 'is-active' : ''}`}
                    title={favorites.includes(selectedOnMap.id) ? 'Rimuovi dai salvati' : 'Salva'}
                    onClick={() => toggleFavorite(selectedOnMap.id)}
                  >
                    <Heart size={16} fill={favorites.includes(selectedOnMap.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
              {selectedOnMap.thumbnailUrl && (
                <img src={selectedOnMap.thumbnailUrl} alt="thumbnail" className="w-full rounded-lg border border-border" />
              )}
              {selectedOnMap.analysis.creatorOpinion && (
                <div className="bg-surface-secondary rounded-lg p-3">
                  <p className="small-text text-text-tertiary mb-1">Parere del creator</p>
                  <p className="body-text">{selectedOnMap.analysis.creatorOpinion}</p>
                </div>
              )}
              <div className="flex gap-2">
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOnMap.analysis.restaurantName + ' ' + (selectedOnMap.analysis.formattedAddress || selectedOnMap.analysis.restaurantLocation))}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">Apri mappa</a>
                <a href={selectedOnMap.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">Guarda il video</a>
              </div>
            </div>
          )}
        </div>
      </aside>
    </main>
  );
}
