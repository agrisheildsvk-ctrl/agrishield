const prisma = require('../config/database');

exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const category_id = req.query.category_id ? parseInt(req.query.category_id) : undefined;
    const search = req.query.search || undefined;

    const where = {};
    if (category_id) {
      where.category_id = category_id;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        category: { select: { name: true } },
        images: {
          where: { is_primary: true },
          take: 1,
          select: { image_url: true }
        }
      }
    });

    // Format the response to match the PHP version exactly
    const formattedProducts = products.map(p => ({
      ...p,
      category_name: p.category?.name || null,
      primary_image: p.images[0]?.image_url || null,
      // Remove Prisma nested objects to flat structure expected by frontend
      category: undefined,
      images: undefined
    }));

    const total = await prisma.product.count({ where });

    res.status(200).json({
      data: formattedProducts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database error: ' + error.message });
  }
};

exports.show = async (req, res) => {
  try {
    const id = parseInt(req.params.id || req.query.id);
    
    if (!id) {
      return res.status(400).json({ message: 'Product ID required' });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        images: { select: { image_url: true, is_primary: true } }
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const formattedProduct = {
      ...product,
      category_name: product.category?.name || null,
      images: product.images.map(img => img.image_url)
    };

    res.status(200).json(formattedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database error: ' + error.message });
  }
};
