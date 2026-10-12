import { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { fetchPokemonPage } from '../api';
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
    <FlatList
      data={pokemon}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      initialNumToRender={10}
      windowSize={7}
      ListFooterComponent={loadingMore ? <ActivityIndicator style={{ margin: 16 }} /> : null}
    />
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
});