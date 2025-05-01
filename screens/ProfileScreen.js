import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import {API_URL} from '@env';

const ProfileScreen = () => {
  const [user, setUser] = useState(null);

  const getUserDetails = async () => {
    const email = await AsyncStorage.getItem('user_id');
    console.log(email)
    const res = await axios.post(`${API_URL}/profile`, { email });
    console.log(res)
    setUser(res.data);
  };

  const changeProfilePic = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.5, includeBase64: true }, async (res) => {
      if (res.assets && res.assets.length > 0) {
        const imageBase64 = `data:${res.assets[0].type};base64,${res.assets[0].base64}`;

        const email = await AsyncStorage.getItem('user_id');
        await axios.post(`${API_URL}/api/user/update-profile-image`, {
          email,
          image: imageBase64,
        });
        setUser((prev) => ({ ...prev, profileImage: imageBase64 }));
        Alert.alert('Profile picture updated!');
      }
    });
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  if (!user) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header} />

      <TouchableOpacity onPress={changeProfilePic}>
        <Image
          source={{
            uri: user.profileImage
              ? user.profileImage
              : 'https://cdn-icons-png.flaticon.com/512/921/921071.png',
          }}
          style={styles.avatar}
        />
      </TouchableOpacity>

      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.detail}>{user.email}</Text>
      <Text style={styles.detail}>Age: {user.age}</Text>
      <Text style={styles.detail}>Address: {user.address}</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#FF8C00' }]}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  header: {
    height: 150,
    width: '100%',
    backgroundColor: '#3399FF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: -60,
    borderWidth: 4,
    borderColor: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  detail: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '70%',
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ProfileScreen;
