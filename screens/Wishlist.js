import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

const Wishlist = ({ navigation, route }) => {
    const [wishlistItems,setWishlistItems]=useState([]);
    const [updatingItem,setUpdatingItem]=useState();
    const [loading,setLoading]=useState(true);
    const [error, setError]=useState(null);
    const [userId,setUserId]=useState(null);

    useEffect(()=>{
        const getUserId = async () => {
        try{
            const storeduser=await AsyncStorage.getItem('user_id');
            if(storeduser){
                setUserId(storeduser);
                fetchWishlistItems(storeduser);
            }else{
                setError("User not authenticated. Please log in.");
                setLoading(false);
            }
        }catch(err){
            console.log("Error retrieving user ID:",err);
            setError("Failed to authenticate. Please log in again.");
            setLoading(false);
        }
    };
getUserId();},[]);

const fetchWishlistItems = async (userIdParam) => {
    try {
      setLoading(true);
      const id = userIdParam || userId;
      
      if (!id) {
        throw new Error("User ID not available");
      }
      
      const response = await fetch(`${API_URL}/wishlist?userId=${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const items = await response.json();
      setWishlistItems(items);
    } catch (err) {
      console.error("Error fetching wishlist items:", err);
      setError("Failed to load your wishlist items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeItemFromDatabase = async (itemId) => {
      try {
        setUpdatingItem(itemId);
        const response = await fetch(`${API_URL}/wishlist/${itemId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to remove item. Status: ${response.status}`);
        }
        
        setWishlistItems(prevItems => prevItems.filter(item => item._id !== itemId));
      } catch (err) {
        console.error("Error removing item:", err);
        Alert.alert("Remove Failed", "Failed to remove item. Please try again.");
        fetchWishlistItems(userId);
      } finally {
        setUpdatingItem(null);
      }
    };

    const handleRemoveItem = (itemId) => {
        Alert.alert(
          "Remove Item",
          "Are you sure you want to remove this item from your wishlist?",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Remove",
              onPress: () => removeItemFromDatabase(itemId),
              style: "destructive"
            }
          ]
        );
      };

      const renderWishlistItem = ({ item }) => {
          const isUpdating = updatingItem === item._id;
          
          return (
            <View style={styles.wishlistItem}>
              {isUpdating && (
                <View style={styles.updatingOverlay}>
                  <ActivityIndicator size="small" color="#ff5722" />
                </View>
              )}
              
              <View style={styles.itemImageContainer}>
                <Image 
                  source={{ uri: item.ImageUrl }} 
                  style={styles.itemImage}
                  defaultSource={require('../assets/placeholder.png')}
                  onError={() => console.log("Failed to load image:", item.ImageUrl)}
                />
              </View>
              
              <View style={styles.itemActions}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemBrand}>{item.Brand || 'No Brand'}</Text>
                <Text style={styles.itemPrice}>₹{item.price}/kg</Text>
                <TouchableOpacity 
                  style={styles.removeButton} 
                  onPress={() => handleRemoveItem(item._id)}
                  disabled={isUpdating}
                >
                  <AntDesign name="delete" size={20} color={isUpdating ? "#ccc" : "#ff5722"} />
                </TouchableOpacity>
              </View>
            </View>
          );
        };
  const renderEmptyWishlist = () => {
      return (
        <View style={styles.emptyWishlistContainer}>
          <AntDesign name="hearto" size={80} color="#ccc" />
          <Text style={styles.emptyWishlistText}>Your Wishlist is empty</Text>
        </View>
      );
    };

  if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#ff5722" />
          <Text style={{ marginTop: 10 }}>Loading your wishlist...</Text>
        </View>
      );
    }

    if (error) {
        return (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={[styles.button, { marginTop: 20, backgroundColor: '#ff5722' }]}
              onPress={() => fetchWishlistItems(userId)}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>Try Again</Text>
            </TouchableOpacity>
          </View>
        );
      }
  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wishlist</Text>
          <View style={styles.placeholder}></View>
        </View>
  
        {wishlistItems.length > 0 ? (
          <>
            <FlatList
              data={wishlistItems}
              renderItem={renderWishlistItem}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.wishList}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          renderEmptyWishlist()
        )}
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#0D92F4",
    elevation: 4,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 24,
  },
  wishList: {
    paddingBottom: 100,
  },
  wishlistItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  itemImageContainer: {
    marginRight: 15,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: "cover",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemBrand: {
    fontSize: 14,
    color: "#888",
    marginVertical: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: "#888",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  quantityButton: {
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledText: {
    color: "#ccc",
  },
  itemQuantity: {
    marginHorizontal: 15,
    fontSize: 16,
  },
  itemActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  itemTotalPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  removeButton: {
    marginTop: 10,
  },
  emptyWishlistContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyWishlistText: {
    fontSize: 18,
    color: "#888",
    marginVertical: 15,
  },
  continueShopping: {
    padding: 10,
    backgroundColor: "#ff5722",
    borderRadius: 5,
  },
  continueShoppingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#ff5722",
  },
  checkoutButton: {
    padding: 15,
    backgroundColor: "#ff5722",
    borderRadius: 5,
    marginTop: 20,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cartSummary: {
    backgroundColor: "#fff",
    padding: 15,
    marginTop: 20,
    borderRadius: 8,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff5722",
  },
});
export default Wishlist;