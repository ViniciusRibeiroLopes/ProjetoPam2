import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import ListScreen from './src/screens/ListScreen';
import FormScreen from './src/screens/FormScreen';
const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="List" component={ListScreen} options={{ title: 'Clientes' }} />
          <Stack.Screen name="Form" component={FormScreen} options={{ title: 'Novo / Editar' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
