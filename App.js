import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import PokedexScreen from './src/screens/PokedexScreen';
import DetailScreen from './src/screens/DetailScreen';
import TeamScreen from './src/screens/TeamScreen';
import GameScreen from './src/screens/GameScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Pokedex') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'My Team') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Game') {
            iconName = focused ? 'game-controller' : 'game-controller-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Pokedex" component={PokedexScreen} />
      <Tab.Screen name="My Team" component={TeamScreen} />
      <Tab.Screen name="Game" component={GameScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}