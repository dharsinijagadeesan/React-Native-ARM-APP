import React from 'react'
import { StyleSheet } from 'react-native'
import Layout from '../components/Layout/Layout'
import Products from '../components/Products/Products'
import Header from '../components/Layout/Header'
import Categories from '../components/category/Categories'
import Banner from '../components/Banner/Banner'
import { View } from 'react-native'

const Home = () => {
  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <Categories />
      <Banner />
    </View>
  )

  return (
    <Layout style={styles.container}>
      <Header />
      <Products ListHeaderComponent={ListHeader} />
    </Layout>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginTop:0,
    padding: 0,
    backgroundColor: '#fff',
    marginBottom: 10 
  },
})
