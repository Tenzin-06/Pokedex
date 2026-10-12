import { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import { fetchPokemonPage, fetchAllPokemon } from '../api';
import PokemonCard from '../components/PokemonCard';

const PAGE_SIZE = 20;
const START_OFFSET = 182;
const MAX_POKEMON = 1025;

export default function PokedexScreen({ navigation }) {
  const [pokemon, setPokemon] = useState([]);
  const [offset, setOffset] = useState(START_OFFSET);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [allPokemon, setAllPokemon] = useState(null);
  const [searching, setSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchError, setSearchError] = useState(null);

  const loadFirstPage = async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await fetchPokemonPage(START_OFFSET, PAGE_SIZE);

      setPokemon(list);
      setOffset(START_OFFSET + PAGE_SIZE);
      setHasMore(START_OFFSET + PAGE_SIZE < MAX_POKEMON);
    } catch (err) {
      setError('Could not load Pokémon. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const limit = Math.min(PAGE_SIZE, MAX_POKEMON - offset);

      if (limit <= 0) {
        setHasMore(false);
        return;
      }

      const list = await fetchPokemonPage(offset, limit);
      setPokemon((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const fresh = list.filter((p) => !seen.has(p.id));
        return [...prev, ...fresh];
      });

      setOffset((prev) => prev + limit);
      setHasMore(offset + limit < MAX_POKEMON);
    } catch (err) {
      // keep the list we already have; the user can scroll again to retry
    } finally {
      setLoadingMore(false);
    }
  };

  const ensureAllLoaded = async () => {
    if (allPokemon) return allPokemon;
    setSearching(true);

    try {
        const all = await fetchAllPokemon();
        setAllPokemon(all);
        return all;
    } finally {
        setSearching(false);
    }
  };

  const openDetail = useCallback(
    (id) => navigation.navigate('Detail', { id }),
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <PokemonCard
        id={item.id}
        name={item.name}
        image={item.image}
        onPress={openDetail}
      />
    ),
    [openDetail]
  );

  useEffect(() => {
    loadFirstPage();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
        const text = query.trim().toLowerCase();
        setDebouncedQuery(text);
        
        if (text !== ''){
            setSearchError(null);

            try {
                await ensureAllLoaded();
            } catch (err) {
                setSearchError('Search failed. Check your internet connection.');
            }
        }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const results = 
    debouncedQuery && allPokemon
        ? allPokemon.filter((p) => p.name.includes(debouncedQuery))
        : null;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={loadFirstPage} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
        <TextInput 
            style={styles.search}
            placeholder="Search all Pokemon"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize='none'
        />
        {searching && <ActivityIndicator style={{ margin: 12 }} />}
        {searchError && <Text style={styles.empty}>{searchError}</Text>}

        <FlatList
            data={results ?? pokemon}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            onEndReached={results ? null : loadMore}
            onEndReachedThreshold={0.5}
            initialNumToRender={10}
            windowSize={7}
            ListEmptyComponent={
                results ? <Text style={styles.empty}>No Pokemon found for "{debouncedQuery}"</Text> : null
            }
            ListFooterComponent={
                !results && loadingMore ? <ActivityIndicator style={{ margin: 16 }} /> : null
            }
        />

    </View>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1,
     alignItems: 'center',
      justifyContent: 'center',
       padding: 20 
  },

  errorText: { 
    fontSize: 16, 
    textAlign: 'center', 
    marginBottom: 12 
  },

  screen: { flex: 1 },
  search: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    height: 48,
  },

  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: '#666',
  }
});