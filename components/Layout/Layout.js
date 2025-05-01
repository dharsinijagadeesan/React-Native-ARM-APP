import { View, Text, StatusBar,StyleSheet } from 'react-native'
import React from 'react'
import Header from './Header'
import Footer from './Footer'
import Categories from '../category/Categories'

const Layout = ({children}) => {
  return (
    <>
    <StatusBar/>
      <View>{children}</View>
      <View style={styles.footer}>
        <Footer/>
      </View>
    </>
  )
}

const styles=StyleSheet.create({
  footer:{
    display:"flex",
    width:"100%",
    flex:1,
    justifyContent:"flex-end",
    zIndex:100,
    borderTopWidth:1,
    position:"absolute",
    bottom:0,
    padding:10,
    borderColor:"lightgray",
    backgroundColor:"#0D92F4",
  }
})
export default Layout