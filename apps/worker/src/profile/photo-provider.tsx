import 'expo-sqlite/localStorage/install';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

const storageKey = 'safira.worker.profile-photo.v1';

interface ProfilePhotoContextValue {
  photoUri: string | null;
  error: string | null;
  savePhoto(uri: string | null): boolean;
}

const ProfilePhotoContext = createContext<ProfilePhotoContextValue | null>(
  null,
);

export function ProfilePhotoProvider({ children }: { children: ReactNode }) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setPhotoUri(localStorage.getItem(storageKey));
      } catch {
        setError('Your saved profile photo could not be loaded.');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function savePhoto(uri: string | null): boolean {
    try {
      if (uri) localStorage.setItem(storageKey, uri);
      else localStorage.removeItem(storageKey);
      setPhotoUri(uri);
      setError(null);
      return true;
    } catch {
      setError('Your profile photo could not be saved on this device.');
      return false;
    }
  }

  return (
    <ProfilePhotoContext.Provider value={{ photoUri, error, savePhoto }}>
      {children}
    </ProfilePhotoContext.Provider>
  );
}

export function useProfilePhoto() {
  const context = useContext(ProfilePhotoContext);
  if (!context)
    throw new Error('useProfilePhoto must be used in ProfilePhotoProvider.');
  return context;
}
