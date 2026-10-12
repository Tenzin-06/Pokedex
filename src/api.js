const BASE_URL = 'https://pokeapi.co/api/v2';

export function getIdFromUrl(url) {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]);
}

export function getArtworkUrl(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export async function fetchPokemonPage(offset = 0, limit = 20) {
    const response = await fetch(`${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`);
    
    if (!response.ok) {
        throw new Error('Request faile with status ' + response.status);
    }
    const data = await response.json();
    return data.results.map((item) => {
        const id = getIdFromUrl(item.url);
        return { 
            id, name: item.name,
            image: getArtworkUrl(id)
        };
    });
}