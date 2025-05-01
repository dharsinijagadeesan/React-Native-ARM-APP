import { View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import AntDesign from "react-native-vector-icons/AntDesign"
import React from 'react'
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import Cart from '../../screens/Cart'

const Footer = () => {
  const route=useRoute();
  const navigation = useNavigation();
  return (
    <View style={styles.container} >

      <TouchableOpacity style={styles.menuContainer} onPress={()=>navigation.navigate('home')}>
        <AntDesign style={[styles.icon, route.name==="home" && styles.active]} name="home"/>
        <Text style={[styles.iconText, route.name==="home" && styles.active]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer} onPress={()=>navigation.navigate('Wishlist')}>
        <AntDesign style={[styles.icon, route.name==="wishlist" && styles.active]} name="hearto"/>
        <Text style={[styles.iconText, route.name==="wishlist" && styles.active]}>Wishlist</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer} onPress={()=>navigation.navigate('Profile')}>
        <AntDesign style={[styles.icon, route.name==="account" && styles.active]} name="user"/>
        <Text style={[styles.iconText, route.name==="account" && styles.active]}>Account</Text>
      </TouchableOpacity>

      <TouchableOpacity 
      style={styles.menuContainer} 
  onPress={() => navigation.navigate('Cart')}
>
  <AntDesign 
    style={[styles.icon, route.name === "cart" && styles.active]} 
    name="shoppingcart" 
  />
  <Text style={[styles.iconText, route.name === "cart" && styles.active]}>
    Cart
  </Text>
</TouchableOpacity>


      <TouchableOpacity style={styles.menuContainer} onPress={()=>anavigation.navigate('Login')}>
        <AntDesign style={styles.icon} name="logout"/>
        <Text style={styles.iconText}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles=StyleSheet.create({
  container:{
    flexDirection:"row",
    justifyContent:"space-between",
    paddingHorizontal:10,

  },
  menuContainer:{
    alignItems:"center",
    justifyContent:"center"
  },
  icon:{
    fontSize:25,
    color:"#000000",
  },
  iconText:{
    color:"#ffffff",
    fontSize:10,
  },
  active:{
    color:'blue',
  }
})
export default Footer