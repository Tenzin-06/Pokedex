import { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { fetchPokemonPage } from '../api';
import PokemonCard from '../components/PokemonCard';

export default function PokedexScreen({ navigation }) {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPokemon = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchPokemonPage(182, 20);
      setPokemon(list);
    } catch (err) {
      setError('Could not load Pokémon. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPokemon();
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
        <Button title="Retry" onPress={loadPokemon} />
      </View>
    );
  }

  return (
    <FlatList
      data={pokemon}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <PokemonCard
          id={item.id}
          name={item.name}
          image={item.image}
          onPress={() => navigation.navigate('Detail', { id: item.id })}
        />
      )}
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