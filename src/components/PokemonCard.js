import { memo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';

function PokemonCard({ id, name, image, onPress }) {
    return (
        <Pressable style={styles.card} onPress={onPress}>
            <Image source={{ uri: image }} style={styles.image} />
            <View>
                <Text style={styles.number}>#{String(id).padStart(4, '0')}</Text>
                <Text style={styles.name}>{name}</Text>
            </View>
        </Pressable>
    );
}

export default memo(PokemonCard);

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 12,
        marginVertical: 6,
        padding: 10,
        borderRadius: 12,
        elevation: 2,
    },

    image: {
        width: 72,
        height: 72,
        marginRight: 14,
    },

    number: {
        color: '#888',
        fontSize: 12,
    },

    name: {
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
});