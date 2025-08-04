import type { ScrapedData } from "../../types";

const STORAGE_KEY = "scrapedData";

export const saveData = (data: ScrapedData[]) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const loadData = (): ScrapedData[] => {
  if (typeof window !== "undefined") {
    const data = window.localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
  return [];
};
