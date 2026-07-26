const prisma = require('../config/database');

exports.index = async (req, res) => {
  try {
    const user_id = req.user.id;

    const cartItems = await prisma.cartItem.findMany({
      where: { user_id },
      include: {
        product: {
          include: {
            images: {
              where: { is_primary: true },
              take: 1
            }
          }
        }
      }
    });

    const formattedCart = cartItems.map(item => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      name: item.product.name,
      price: item.product.price,
      image_url: item.product.images[0]?.image_url || null
    }));

    res.status(200).json(formattedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database error: ' + error.message });
  }
};

exports.add = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: 'Product ID required' });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { user_id, product_id }
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
      return res.status(200).json({ message: 'Cart updated' });
    } else {
      await prisma.cartItem.create({
        data: {
          user_id,
          product_id,
          quantity
        }
      });
      return res.status(201).json({ message: 'Added to cart' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database error: ' + error.message });
  }
};
