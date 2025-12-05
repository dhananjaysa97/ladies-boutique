const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      id: 'floral-summer-midi-dress',
      name: 'Floral Summer Midi Dress',
      description:
        'Lightweight floral midi dress perfect for brunches and daytime outings.',
      price: 69.99,
      imageUrl:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
      category: 'Dresses',
      sizes: ['XS', 'S', 'M', 'L'],
      color: 'Pink Floral',
      isHot: false,
      isLatest: true,
    },
    {
      id: 'black-evening-slip-dress',
      name: 'Black Evening Slip Dress',
      description:
        'Chic black slip dress with a flattering silhouette for evening events.',
      price: 89.99,
      imageUrl:
        'https://images.unsplash.com/photo-1521572163474-4f04a0f1f4f3?auto=format&fit=crop&w=800&q=80',
      category: 'Dresses',
      sizes: ['S', 'M', 'L', 'XL'],
      color: 'Black',
      isHot: true,
      isLatest: true,
    },
    {
      id: 'white-linen-button-shirt',
      name: 'White Linen Button-Up Shirt',
      description:
        'Breezy white linen shirt that pairs perfectly with jeans or skirts.',
      price: 49.99,
      imageUrl:
        'https://images.unsplash.com/photo-1528701800489-20be3c30c1d5?auto=format&fit=crop&w=800&q=80',
      category: 'Tops',
      sizes: ['XS', 'S', 'M', 'L'],
      color: 'White',
      isHot: false,
      isLatest: true,
    },
    {
      id: 'pastel-pink-puff-blouse',
      name: 'Pastel Pink Puff-Sleeve Blouse',
      description:
        'Romantic puff-sleeve blouse in a soft pastel pink shade.',
      price: 54.99,
      imageUrl:
        'https://images.unsplash.com/photo-1521572163474-68621c5a13a0?auto=format&fit=crop&w=800&q=80',
      category: 'Tops',
      sizes: ['S', 'M', 'L'],
      color: 'Pink',
      isHot: true,
      isLatest: false,
    },
    {
      id: 'high-waisted-wide-leg-trousers',
      name: 'High-Waisted Wide-Leg Trousers',
      description:
        'Elegant wide-leg trousers that elevate your office and evening looks.',
      price: 59.99,
      imageUrl:
        'https://images.unsplash.com/photo-1533839282291-38d1a7c79c3c?auto=format&fit=crop&w=800&q=80',
      category: 'Bottoms',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      color: 'Beige',
      isHot: false,
      isLatest: true,
    },
    {
      id: 'classic-blue-skinny-jeans',
      name: 'Classic Blue Skinny Jeans',
      description:
        'Timeless skinny jeans in a flattering mid-wash blue.',
      price: 79.99,
      imageUrl:
        'https://images.unsplash.com/photo-1521572163474-68622f37a74a?auto=format&fit=crop&w=800&q=80',
      category: 'Bottoms',
      sizes: ['S', 'M', 'L', 'XL'],
      color: 'Blue',
      isHot: true,
      isLatest: false,
    },
    {
      id: 'embroidered-anarkali-kurta',
      name: 'Embroidered Anarkali Kurta',
      description:
        'Graceful Anarkali kurta with intricate embroidery for festive occasions.',
      price: 99.99,
      imageUrl:
        'https://images.unsplash.com/photo-1551024739-78e9d60c45c1?auto=format&fit=crop&w=800&q=80',
      category: 'Ethnic Wear',
      sizes: ['S', 'M', 'L', 'XL'],
      color: 'Maroon',
      isHot: true,
      isLatest: true,
    },
    {
      id: 'soft-silk-saree-gold-border',
      name: 'Soft Silk Saree with Gold Border',
      description:
        'Elegant soft silk saree featuring a traditional gold border.',
      price: 129.99,
      imageUrl:
        'https://images.unsplash.com/photo-1521572163474-68621c5b12ff?auto=format&fit=crop&w=800&q=80',
      category: 'Ethnic Wear',
      sizes: ['M', 'L'],
      color: 'Green',
      isHot: false,
      isLatest: true,
    },
    {
      id: 'classic-black-blazer',
      name: 'Classic Black Blazer',
      description:
        'Structured black blazer that instantly sharpens any outfit.',
      price: 89.99,
      imageUrl:
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      category: 'Outerwear',
      sizes: ['S', 'M', 'L', 'XL'],
      color: 'Black',
      isHot: true,
      isLatest: false,
    },
    {
      id: 'beige-trench-coat',
      name: 'Beige Trench Coat',
      description:
        'Timeless trench coat in a warm beige tone for transitional weather.',
      price: 149.99,
      imageUrl:
        'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80',
      category: 'Outerwear',
      sizes: ['S', 'M', 'L'],
      color: 'Beige',
      isHot: false,
      isLatest: true,
    },
    {
      id: 'soft-knit-lounge-set',
      name: 'Soft Knit Lounge Set',
      description:
        'Cozy knit lounge set perfect for relaxing at home.',
      price: 59.99,
      imageUrl:
        'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80',
      category: 'Loungewear',
      sizes: ['S', 'M', 'L'],
      color: 'Grey',
      isHot: false,
      isLatest: true,
    },
    {
      id: 'cotton-jogger-pants',
      name: 'Cotton Jogger Pants',
      description:
        'Soft cotton joggers with a relaxed fit and tapered ankle.',
      price: 39.99,
      imageUrl:
        'https://images.unsplash.com/photo-1495121553079-4c61bcce189c?auto=format&fit=crop&w=800&q=80',
      category: 'Loungewear',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      color: 'Black',
      isHot: true,
      isLatest: false,
    }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      create: p,
      update: p,
    });
  }

  console.log('Seeded sample products.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
