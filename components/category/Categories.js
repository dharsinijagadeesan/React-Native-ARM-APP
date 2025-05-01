import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image} from 'react-native';
import React from 'react';
import { categoriesData } from '../../data/CategoriesData';
import { useNavigation } from '@react-navigation/native';

const Categories = () => {

  const navigation=useNavigation();
  return (
    <ScrollView >
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
      {categoriesData?.map((item)=>(
        <View key={item._id} >
          <TouchableOpacity style={styles.catContainer}
            onPress={()=>navigation.navigate(item.path)}
          >
            <Image 
                source={item.icon} 
                style={styles.catIcon} 
            />
            <Text style={styles.catTitle}>{item.name}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
    </ScrollView>
    </ScrollView>
  )
}

const styles=StyleSheet.create({
  container:{
    backgroundColor:'#ffffff',
    padding:4,
    flexDirection:'row'
  },
  catContainer:{
    padding:4,
    justifyContent:"space-between",
    alignItems:"center"
  },
  catIcon:{
    //fontSize:26,
    verticalAlign:'top',
    width: 70,  // Adjust size as needed
    height: 70,
    borderRadius: 50,
  },
  catTitle:{
    fontSize:14,
  }
})
export default Categories;

