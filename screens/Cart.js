import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

const Cart = ({ navigation, route }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const localNavigation = useNavigation(); 
  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId) {
          setUserId(storedUserId);
          fetchCartItems(storedUserId);
        } else {
          setError("User not authenticated. Please log in.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error retrieving user ID:", err);
        setError("Failed to authenticate. Please log in again.");
        setLoading(false);
      }
    };

    getUserId();
  }, []);

  const fetchCartItems = async (userIdParam) => {
    try {
      setLoading(true);
      const id = userIdParam || userId;
      
      if (!id) {
        throw new Error("User ID not available");
      }
      
      const response = await fetch(`${API_URL}/cart?userId=${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const items = await response.json();
      setCartItems(items);
    } catch (err) {
      console.error("Error fetching cart items:", err);
      setError("Failed to load your cart items. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const updateItemInDatabase = async (itemId, newQuantity) => {
    try {
      setUpdatingItem(itemId);
      const response = await fetch(`${API_URL}/cart/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update item. Status: ${response.status}`);
      }
      setCartItems(prevItems => 
        prevItems.map(item => 
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      
      console.log(`Item ${itemId} quantity updated to ${newQuantity}`);
    } catch (err) {
      console.error("Error updating item:", err);
      Alert.alert("Update Failed", "Failed to update item quantity. Please try again.");
      fetchCartItems(userId);
    } finally {
      setUpdatingItem(null);
    }
  };
  
  const removeItemFromDatabase = async (itemId) => {
    try {
      setUpdatingItem(itemId);
      const response = await fetch(`${API_URL}/cart/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to remove item. Status: ${response.status}`);
      }
      
      setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
    } catch (err) {
      console.error("Error removing item:", err);
      Alert.alert("Remove Failed", "Failed to remove item. Please try again.");
      fetchCartItems(userId);
    } finally {
      setUpdatingItem(null);
    }
  };
  const increaseQuantity = (itemId, currentQuantity) => {
    const newQuantity = currentQuantity + 1;
    updateItemInDatabase(itemId, newQuantity);
  };

  const decreaseQuantity = (itemId, currentQuantity) => {
    if (currentQuantity > 1) {
      const newQuantity = currentQuantity - 1;
      updateItemInDatabase(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
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

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Cart Empty", "Please add items to your cart before checkout.");
      return;
    }
    navigation.navigate('Checkout', { cartItems, totalAmount: calculateTotalPrice() });
  };

  const handleContinueShopping = () => {
    navigation.navigate('home');
  };

  const renderCartItem = ({ item }) => {
    const isUpdating = updatingItem === item._id;
    
    return (
      <View style={styles.cartItem}>
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
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemBrand}>{item.Brand || 'No Brand'}</Text>
          <Text style={styles.itemPrice}>₹{item.price}/kg</Text>
          
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={() => decreaseQuantity(item._id, item.quantity)}
              disabled={isUpdating || item.quantity <= 1}
            >
              <Text style={[
                styles.quantityButtonText,
                (isUpdating || item.quantity <= 1) && styles.disabledText
              ]}>-</Text>
            </TouchableOpacity>
            
            <Text style={styles.itemQuantity}>{item.quantity}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={() => increaseQuantity(item._id, item.quantity)}
              disabled={isUpdating}
            >
              <Text style={[
                styles.quantityButtonText,
                isUpdating && styles.disabledText
              ]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.itemActions}>
          <Text style={styles.itemTotalPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
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

  const renderEmptyCart = () => {
    return (
      <View style={styles.emptyCartContainer}>
        <AntDesign name="shoppingcart" size={80} color="#ccc" />
        <Text style={styles.emptyCartText}>Your cart is empty</Text>
        <TouchableOpacity 
          style={styles.continueShopping} 
          onPress={handleContinueShopping}
        >
          <Text style={styles.continueShoppingText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff5722" />
        <Text style={{ marginTop: 10 }}>Loading your cart...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={[styles.button, { marginTop: 20, backgroundColor: '#ff5722' }]}
          onPress={fetchCartItems}
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
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={styles.placeholder}></View>
      </View>

      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.cartList}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.cartSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>₹{calculateTotalPrice().toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee:</Text>
              <Text style={styles.summaryValue}>₹40.00</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>₹{(calculateTotalPrice() + 40).toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        renderEmptyCart()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
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
  cartList: {
    paddingBottom: 100,
  },
  cartItem: {
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
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCartText: {
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

export default Cart;
//https://www.youtube.com/watch?v=WhFSaVXx3qE