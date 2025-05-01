import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './screens/Home';
import About from './screens/About';
import ProductDetails from './screens/ProductDetails';
import Cart from './screens/Cart';
import Splash from './screens/SplashScreen';
import Login from './screens/LoginScreen';
import Register from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import Wishlist from './screens/Wishlist';

const Stack=createNativeStackNavigator();

const Auth = () => {
  // Stack Navigator for Login and Sign up Screen
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={Login}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{
          title: 'Register', //Set Header Title
          headerStyle: {
            backgroundColor: '#307ecc', //Set Header color
          },
          headerTintColor: '#fff', //Set Header text color
          headerTitleStyle: {
            fontWeight: 'bold', //Set Header text style
          },
        }}
      />
    </Stack.Navigator>
  );
};


export default function App() {
  return (
    <NavigationContainer>
       <Stack.Navigator initialRouteName='Splash'>
       <Stack.Screen
          name="Splash"
          component={Splash}
          // Hiding header for Splash Screen
          options={{headerShown: false}}
        />
        {/* Auth Navigator: Include Login and Signup */}
        <Stack.Screen
          name="Auth"
          component={Auth}
          options={{headerShown: false}}
        />
          <Stack.Screen 
            name='home' 
            component={Home} 
            options={{
              headerShown:false,
            }}/>
            <Stack.Screen 
            name='about' 
            component={About} 
            options={{
              headerShown:false,
            }}/>
            <Stack.Screen name='productDetails' options={{headerShown:false}} component={ProductDetails}/>
            <Stack.Screen name="Wishlist" options={{headerShown:false}} component={Wishlist} />
            <Stack.Screen name="Cart" options={{headerShown:false}} component={Cart} />
            <Stack.Screen name="Profile" options={{headerShown:false}} component={ProfileScreen} />
            <Stack.Screen name='mspipes' component={About}/>
       </Stack.Navigator>
    </NavigationContainer>
    
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
