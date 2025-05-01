import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import React, { useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import {menuIcon} from '../Layout/ARM-LOGO.png';

const Header = () => {
  const [searchText, setSearchText] = useState('');

  // Function to handle search
  const handleSearch = () => {
    console.log(searchText);
    setSearchText('');
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity>
        <FontAwesome name="bars" style={styles.icon} />
      </TouchableOpacity>
      <View style={styles.container}>
        <TextInput
          style={styles.inputBox}
          value={searchText}
          placeholder="Search for products..."
          onChangeText={(t) => setSearchText(t)}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <FontAwesome name="search" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 80,
    backgroundColor: '#0D92F4',
    paddingHorizontal: 15,
    flexDirection: 'row', // Row layout for bars icon and search bar
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    position: 'relative', // Needed for absolute positioning of the search button
  },
  inputBox: {
    marginLeft:10,
    width:"90%",
    flex: 1,  
    height: 40,
    borderWidth: 0.3,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    paddingLeft: 15,
    fontSize: 16,
    color: '#000000',
  },
  searchBtn: {
    position: 'absolute',
    right: 10, 
  },
  icon: {
    color: '#000000',
    fontSize: 24,
  },
});

export default Header;
