import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

const Products = ({ ListHeaderComponent }) => {
  const [products, setProducts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const handleProductPress = (id) => {
    navigation.navigate("productDetails", { _id: id });
  };
const handleAddToCart = async (productId, quantity = 1) => {
  try {
    const userId = await AsyncStorage.getItem('user_id');
    
    if (!userId) {
      alert("Please login to add items to cart");
      return;
    }
    const response = await fetch(`${API_URL}/add-to-cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        productId,
        quantity
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add item to cart');
    }
    alert("Item added to cart successfully!");
  } catch (error) {
    console.error("Error adding to cart:", error);
    alert(`Failed to add item to cart: ${error.message}`);
  } finally {
  }
};

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/products`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        
        const productArray = Array.isArray(data) 
          ? data 
          : (data.products || data.data || []);
        
        console.log("Processed products:", productArray.length);
        setProducts(productArray);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      });
  }, []);

  const handleAddToWishlist = async (productId, quantity = 1) => {

    try {
      const userId = await AsyncStorage.getItem('user_id');

      if (!userId) {
        alert("Please login to add items to wishlist");
        return;
      }
      
      const isAlreadyInWishlist = wishlistItems.includes(productId);
      const endpoint = isAlreadyInWishlist ? 'remove-from-wishlist:productId' : 'add-to-wishlist';
      
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, productId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update wishlist');
      }
      
      // Update local state only after successful response
      setWishlistItems(prev =>
        isAlreadyInWishlist
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );
      
      alert(
        isAlreadyInWishlist
          ? "Item removed from wishlist"
          : "Item added to wishlist"
      );
      
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      alert(`Failed to add item to wishlist: ${error.message}`);
    } finally {
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff5722" />
        <Text style={{marginTop: 10}}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            fetch(`${API_URL}/products`)
              .then(response => response.json())
              .then(data => {
                const productArray = Array.isArray(data) ? data : (data.products || data.data || []);
                setProducts(productArray);
                setLoading(false);
              })
              .catch(error => {
                console.error("Error fetching products:", error);
                setError("Failed to load products. Please try again later.");
                setLoading(false);
              });
          }}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.centered}>
        <AntDesign name="inbox" size={50} color="#ccc" />
        <Text style={{marginTop: 10}}>No products found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => String(item._id)}
      numColumns={2}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.productCard}
          onPress={() => handleProductPress(item._id)}
        >
          {/* Wishlist Icon */}
          <TouchableOpacity 
            style={styles.wishlistIcon}
            onPress={(e) => {
              e.stopPropagation();
            }}
          >
            {/* <AntDesign name="hearto" size={20} color="red" onPress={()=>handleAddToWishlist(item._id) }/> */}
            <AntDesign 
    name={wishlistItems.includes(item._id) ? "heart" : "hearto"} 
    size={20} 
    color="red" 
    onPress={() => handleAddToWishlist(item._id)} 
  />
          </TouchableOpacity>

          {/* Image with fallback */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: item.ImageUrl }} 
              style={styles.image} 
              onError={(e) => console.log("Image failed to load:", item.ImageUrl)}
            />
          </View>
          
          <Text style={styles.name} numberOfLines={4}>{item.name}</Text>
          <Text style={styles.brand}>Brand: {item.Brand}</Text>
          <Text style={styles.price}>₹{item.price}/kg</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.addToCartButton} 
              onPress={(e) => {
                e.stopPropagation();
                handleAddToCart(item._id);
              }}
            >
              <Text style={styles.buttonText}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.buyNowButton} 
              onPress={(e) => {
                e.stopPropagation();
                handleProductPress(item._id);
              }}
            >
              <Text style={styles.buttonText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 8,
    backgroundColor: "#f5f5f5",
    paddingBottom: 150, // Add some padding at the bottom for better scrolling
  },
  productCard: {
    flex: 1,
    maxWidth: "48%", // Slightly less than 50% to allow for margins
    backgroundColor: "#fff",
    margin: 3,
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center",
    position: "relative",
  },
  wishlistIcon: {
    position: "absolute",
    top: 2,
    right: 2,
    zIndex: 1,
    padding: 5, 
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: "cover",
  },
  name: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom:8,
    color: "#333",
    textAlign: "center",
    height: 40, // Fixed height for product name
  },
  brand: {
    fontSize: 10,
    color: "#666",
    marginTop: -5,
  },
  price: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ff5722",
    marginVertical: 3,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "space-between",
    width: "100%",
  },
  addToCartButton: {
    backgroundColor: "#9bd4fd",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 5,
    flex: 1,
    marginRight: 3,
    alignItems: "center",
    justifyContent:"center"
  },
  buyNowButton: {
    backgroundColor: "#ffa4c8",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  buttonText: {
    color: "#000000",
    fontSize: 10,
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#ff5722",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});

export default Products;