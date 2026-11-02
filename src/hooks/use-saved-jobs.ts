'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface SavedJobItem {
  id: string;
  urlId: string;
  title: string;
  companyName: string;
  location: string;
  salary?: string;
  skills: string[];
  expiryDate?: string | Date;
  createdAt?: string | Date;
  savedAt: string;
}

const STORAGE_KEY = 'hirelytics_saved_jobs';
const EVENT_NAME = 'hirelytics_saved_jobs_changed';

export function useSavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loadSaved = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSavedJobs(JSON.parse(stored));
        } else {
          setSavedJobs([]);
        }
      } catch (err) {
        console.error('Failed to load saved jobs from localStorage:', err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSaved();

    const handleStorageChange = () => {
      loadSaved();
    };

    window.addEventListener(EVENT_NAME, handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(EVENT_NAME, handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const saveToStorage = (items: SavedJobItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setSavedJobs(items);
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch (err) {
      console.error('Failed to save jobs to localStorage:', err);
    }
  };

  const isSaved = (jobIdOrUrlId: string) => {
    return savedJobs.some((item) => item.id === jobIdOrUrlId || item.urlId === jobIdOrUrlId);
  };

  const toggleSave = (job: {
    id: string;
    urlId: string;
    title: string;
    companyName: string;
    location: string;
    salary?: string;
    skills?: string[];
    expiryDate?: string | Date;
    createdAt?: string | Date;
  }) => {
    const identifier = job.urlId || job.id;
    const alreadySaved = isSaved(identifier);

    if (alreadySaved) {
      const filtered = savedJobs.filter(
        (item) => item.id !== identifier && item.urlId !== identifier
      );
      saveToStorage(filtered);
      toast.success('Job removed from saved');
    } else {
      const newItem: SavedJobItem = {
        id: job.id,
        urlId: job.urlId,
        title: job.title,
        companyName: job.companyName,
        location: job.location,
        salary: job.salary,
        skills: job.skills || [],
        expiryDate: job.expiryDate,
        createdAt: job.createdAt,
        savedAt: new Date().toISOString(),
      };
      saveToStorage([newItem, ...savedJobs]);
      toast.success('Job saved to your bookmarks');
    }
  };

  const removeSavedJob = (jobIdOrUrlId: string) => {
    const filtered = savedJobs.filter(
      (item) => item.id !== jobIdOrUrlId && item.urlId !== jobIdOrUrlId
    );
    saveToStorage(filtered);
    toast.success('Job removed from saved');
  };

  return {
    savedJobs,
    savedJobIds: savedJobs.map((j) => j.urlId || j.id),
    isSaved,
    toggleSave,
    removeSavedJob,
    isLoaded,
  };
}
