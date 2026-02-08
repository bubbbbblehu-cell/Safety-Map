import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CitySelectionScreen from './src/screens/CitySelectionScreen';
import MapScreen from './src/screens/MapScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="CitySelection"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="CitySelection" component={CitySelectionScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
