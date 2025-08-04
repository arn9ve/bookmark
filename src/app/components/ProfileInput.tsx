"use client";

import { useState } from "react";

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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter TikTok or Instagram profile URL"
          className="input-field"
          disabled={isLoading}
        />
      </div>
      <button 
        type="submit" 
        className="btn btn-primary btn-lg hover-lift px-8" 
        disabled={isLoading || !url.trim()}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            Analizzando...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Scopri
          </>
        )}
      </button>
    </form>
  );
}

