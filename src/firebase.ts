import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MediaItem, Movie } from './types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// Create Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
export const auth = supabase.auth;

// 1. Universal Real-Time Listener (Runs on EVERY user's device/browser)
export function subscribeMovies(onData: (movies: Movie[]) => void) {
  // Subscribe to changes in the movies table
  const subscription = supabase
    .channel('movies-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'movies' },
      (payload) => {
        // Fetch all movies when any change occurs
        supabase
          .from('movies')
          .select('*')
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (error) {
              console.warn('[subscribeMovies] Real-time listener warning:', error);
              return;
            }
            onData(data as Movie[]);
          });
      }
    )
    .subscribe();

  // Initial fetch
  supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) {
        console.warn('[subscribeMovies] Initial fetch warning:', error);
        return;
      }
      onData(data as Movie[]);
    });

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription);
  };
}

// 2. Admin Write Operations (Persists globally across the cloud)
export async function addMovieToFirestore(movie: Movie): Promise<void> {
  const { error } = await supabase.from('movies').insert(movie);
  if (error) {
    throw error;
  }
}

export async function updateMovieInFirestore(id: string, updates: Partial<Movie>): Promise<void> {
  const { error } = await supabase.from('movies').update(updates).eq('id', id);
  if (error) {
    throw error;
  }
}

export async function deleteMovieFromFirestore(id: string): Promise<void> {
  const { error } = await supabase.from('movies').delete().eq('id', id);
  if (error) {
    throw error;
  }
}

// Export for backward compatibility
export default supabase;
