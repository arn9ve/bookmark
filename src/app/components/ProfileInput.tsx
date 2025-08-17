"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface ProfileInputProps {
  onScrape: (url: string) => void;
  isLoading: boolean;
}

export default function ProfileInput({ onScrape, isLoading }: ProfileInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      onScrape(url);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex sm:flex-row gap-2 w-full max-w-full">
      <div className="flex-1 w-full">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Inserisci URL profilo TikTok o Instagram"
          className="input-field input-field-sm"
          disabled={isLoading}
        />
      </div>
      <button 
        type="submit" 
        className="btn btn-primary btn-sm hover-lift" 
        disabled={isLoading || !url.trim()}
      >
        {isLoading ? (
          <>
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            Analizzando...
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
         
          </>
        )}
      </button>
    </form>
  );
}

