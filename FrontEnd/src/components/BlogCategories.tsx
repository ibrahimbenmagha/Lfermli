import React from 'react';
import { Badge } from '@/components/ui/badge';

const BlogCategories = ({
  categories,
  selectedCategory,
  onCategoryChange
}: {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}) => {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-semibold mb-4 text-center">Catégories</h2>
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <Badge
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`cursor-pointer ${
              selectedCategory === category ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {category}
          </Badge>
        ))}
      </div>
    </section>
  );
};

export default BlogCategories;
