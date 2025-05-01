require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Product Schema
const ProductSchema = new mongoose.Schema({
  name: String,
  Dimensions: String,
  Brand: String,
  quantity: Number,
  price: Number,
  category: String,
  ImageUrl: String,
});

const Product = mongoose.model("Product", ProductSchema, "product-details");

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    console.log("Fetched Products Count:", products.length);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { quantity },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product quantity updated", product: updatedProduct });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: err.message });
  }
});

// Cart Schema
const CartItemSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const Cart = mongoose.model("CartItem", CartItemSchema, "cart-items");

app.get("/cart", async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }
    const cartItems = await Cart.find({ userId })
      .populate('productId')
      .lean();
    const formattedCartItems = cartItems.map(item => ({
      _id: item._id,
      productId: item.productId._id,
      name: item.productId.name,
      Brand: item.productId.Brand,
      price: item.productId.price,
      ImageUrl: item.productId.ImageUrl,
      quantity: item.quantity
    }));
    
    console.log(`Fetched ${formattedCartItems.length} cart items for user ${userId}`);
    res.json(formattedCartItems);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: err.message });
  }
});
app.patch("/cart/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }
    
    const updatedItem = await Cart.findByIdAndUpdate(
      itemId,
      { quantity },
      { new: true }
    ).populate('productId');
    
    if (!updatedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Error updating cart item" });
  }
});
app.delete("/cart/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const deletedItem = await Cart.findByIdAndDelete(itemId);
    
    if (!deletedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ message: "Error removing item from cart" });
  }
});
app.post("/add-to-cart", async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;
    
    // Validate required fields
    if (!userId || !productId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID and Product ID are required"
      });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Sorry, only ${product.stock} units available`
      });
    }
    let cartItem = await Cart.findOne({ userId, productId });
    
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
      console.log(`Updated cart item quantity for user ${userId}, product ${productId}`);
    } else {
      cartItem = new Cart({ 
        userId, 
        productId, 
        quantity,
        addedAt: new Date()
      });
      await cartItem.save();
      console.log(`Added new item to cart for user ${userId}, product ${productId}`);
    }
    res.status(200).json({ 
      success: true, 
      message: "Item added to cart successfully",
      cartItem
    });
    
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error adding item to cart",
      error: error.message
    });
  }
});
app.post("/checkout", async (req, res) => {
  try {
    const { userId, cartItems, shippingDetails, paymentDetails } = req.body;
    const newOrder = new Order({
      userId,
      items: cartItems,
      total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      shippingDetails,
      paymentDetails,
      status: "pending",
      createdAt: new Date()
    });
    
    await newOrder.save();
    for (const item of cartItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }
    await Cart.deleteMany({ userId });
    
    res.status(200).json({ 
      success: true, 
      orderId: newOrder._id,
      message: "Checkout successful! Your order has been placed."
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ 
      success: false,
      message: "Checkout failed. Please try again." 
    });
  }
});


const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
  address: String,
  password: String,
  profileImage: String,
});

const User = mongoose.model('User', UserSchema,"users");

app.post('/api/user/register', async (req, res) => {
  try {
    const { name, email, age, address, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ status: 'error', msg: 'Email already registered' });
    }

    const user = new User({ name, email, age, address, password });
    await user.save();
    res.json({ status: 'success', msg: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.json({ status: 'error', msg: 'Something went wrong' });
  }
});

app.post('/api/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.json({ status: 'error', msg: 'Invalid credentials' });
    }

    res.json({ status: 'success', msg: 'Login successful', user });
  } catch (err) {
    console.error(err);
    res.json({ status: 'error', msg: 'Something went wrong' });
  }
});

app.post('/profile', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile image
app.post('/api/user/update-profile-image', async (req, res) => {
  const { email, image } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { profileImage: image },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Profile image updated', user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Cart Schema
const WishlistItemSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  Brand: String,
  price: Number,
  quantity: Number,
  ImageUrl: String,
});


const WishlistItem = mongoose.model("WishlistItem", WishlistItemSchema, "wishlist-items");

app.get('/wishlist', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const items = await WishlistItem.find({ userId });
    res.json(items);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist items' });
  }
});

// DELETE a wishlist item by item ID
app.delete('/wishlist/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await WishlistItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Error deleting wishlist item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// (Optional) POST to add new wishlist item
app.post('/wishlist', async (req, res) => {
  const { userId, name, Brand, price, quantity, ImageUrl } = req.body;

  if (!userId || !name || !price) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const newItem = new WishlistItem({ userId, name, Brand, price, quantity, ImageUrl });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error adding item to wishlist:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

app.delete('/remove-from-wishlist/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await WishlistItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Error deleting wishlist item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

app.post('/add-to-wishlist', async (req, res) => {
  const { userId, productId, quantity = 1 } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ message: 'userId and productId are required' });
  }

  try {
    // Check if item already exists in wishlist
    const existing = await WishlistItem.findOne({ userId, productId });
    if (existing) {
      return res.status(200).json({ message: 'Item already in wishlist' });
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const newWishlistItem = new WishlistItem({
      userId,
      productId,
      name: product.name,
      Brand: product.Brand,
      price: product.price,
      quantity,
      ImageUrl: product.ImageUrl,
    });

    await newWishlistItem.save();

    res.status(201).json({ message: 'Item added to wishlist', item: newWishlistItem });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Failed to add item to wishlist' });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
