'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Star, 
  Heart, 
  ShoppingBag,
  Tag,
  Truck,
  Shield,
  Gift,
  Crown,
  Zap,
  Award,
  TrendingUp,
  Clock,
  Users,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isSale?: boolean;
  isPremium?: boolean;
  tags: string[];
  seller: {
    name: string;
    avatar: string;
    rating: number;
    isVerified: boolean;
  };
  delivery: {
    free: boolean;
    time: string;
    cost: number;
  };
}

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export function ShopScreen() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating' | 'new'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Демо данные
  const demoCategories: Category[] = [
    { id: 'all', name: 'Все товары', icon: '🛍️', count: 156 },
    { id: 'food', name: 'Корм и лакомства', icon: '🍖', count: 45 },
    { id: 'toys', name: 'Игрушки', icon: '🎾', count: 32 },
    { id: 'accessories', name: 'Аксессуары', icon: '🎀', count: 28 },
    { id: 'health', name: 'Здоровье', icon: '💊', count: 23 },
    { id: 'clothing', name: 'Одежда', icon: '👕', count: 18 },
    { id: 'grooming', name: 'Груминг', icon: '✂️', count: 15 },
  ];

  const demoProducts: Product[] = [
    {
      id: '1',
      name: 'Премиум корм для собак',
      description: 'Сбалансированное питание с натуральными ингредиентами',
      price: 2500,
      originalPrice: 3000,
      image: '/api/placeholder/300/300',
      category: 'food',
      rating: 4.8,
      reviews: 156,
      isNew: false,
      isSale: true,
      isPremium: true,
      tags: ['премиум', 'натуральный', 'сбалансированный'],
      seller: {
        name: 'ЗооМаркет',
        avatar: '/api/placeholder/40/40',
        rating: 4.9,
        isVerified: true
      },
      delivery: {
        free: true,
        time: '1-2 дня',
        cost: 0
      }
    },
    {
      id: '2',
      name: 'Интерактивная игрушка-головоломка',
      description: 'Развивает интеллект и помогает занять собаку',
      price: 1200,
      image: '/api/placeholder/300/300',
      category: 'toys',
      rating: 4.6,
      reviews: 89,
      isNew: true,
      tags: ['интерактивная', 'развивающая', 'головоломка'],
      seller: {
        name: 'PetToys',
        avatar: '/api/placeholder/40/40',
        rating: 4.7,
        isVerified: true
      },
      delivery: {
        free: false,
        time: '2-3 дня',
        cost: 200
      }
    },
    {
      id: '3',
      name: 'Стильный ошейник с GPS',
      description: 'Отслеживание местоположения и стильный дизайн',
      price: 4500,
      image: '/api/placeholder/300/300',
      category: 'accessories',
      rating: 4.9,
      reviews: 234,
      isPremium: true,
      tags: ['GPS', 'стильный', 'безопасность'],
      seller: {
        name: 'TechPets',
        avatar: '/api/placeholder/40/40',
        rating: 4.8,
        isVerified: true
      },
      delivery: {
        free: true,
        time: '3-5 дней',
        cost: 0
      }
    }
  ];

  useEffect(() => {
    const loadShopData = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCategories(demoCategories);
        setProducts(demoProducts);
      } catch (error) {
        toast.error('Ошибка загрузки магазина');
      } finally {
        setIsLoading(false);
      }
    };

    loadShopData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'new':
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      default:
        return b.reviews - a.reviews;
    }
  });

  const handleAddToCart = (product: Product) => {
    setCart(prev => [...prev, product]);
    toast.success('Товар добавлен в корзину');
  };

  const handleToggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getDiscountPercent = (product: Product) => {
    if (!product.originalPrice) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Загружаем магазин...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden fur-texture">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-pink-200/30 p-4 flex-shrink-0 soft-shadow pencil-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-purple-700 font-display">Магазин</h1>
            <p className="text-sm text-purple-600">Товары для ваших питомцев</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Корзина ({cart.length})
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Избранное ({favorites.length})
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Фильтры
          </Button>
        </div>

        {/* Sort */}
        <div className="mt-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="popular">Популярные</option>
            <option value="price-low">Цена: по возрастанию</option>
            <option value="price-high">Цена: по убыванию</option>
            <option value="rating">По рейтингу</option>
            <option value="new">Новинки</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Categories Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Категории</h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col space-y-1">
                    {product.isNew && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                        Новинка
                      </span>
                    )}
                    {product.isSale && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                        -{getDiscountPercent(product)}%
                      </span>
                    )}
                    {product.isPremium && (
                      <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full flex items-center">
                        <Crown className="h-3 w-3 mr-1" />
                        Премиум
                      </span>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={() => handleToggleFavorite(product.id)}
                    className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        favorites.includes(product.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-400'
                      }`} 
                    />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {product.name}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium ml-1">{product.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({product.reviews})</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Seller */}
                  <div className="flex items-center space-x-2 mb-3">
                    <img
                      src={product.seller.avatar}
                      alt={product.seller.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {product.seller.name}
                    </span>
                    {product.seller.isVerified && (
                      <Shield className="h-4 w-4 text-blue-500" />
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {product.price.toLocaleString()} ₽
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {product.originalPrice.toLocaleString()} ₽
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <Truck className="h-4 w-4" />
                      <span>{product.delivery.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {product.delivery.free ? (
                        <>
                          <Gift className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">Бесплатно</span>
                        </>
                      ) : (
                        <span>{product.delivery.cost} ₽</span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-primary-600 hover:bg-primary-700"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    В корзину
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Товары не найдены</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

