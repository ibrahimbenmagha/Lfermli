// src/components/BlogCard.tsx
import React from "react";
import { Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image: string;
  readTime: string;
  tags: string[];
};

type BlogCardProps = {
  post: BlogPost;
  index?: number;
};

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 flex flex-col">
      <img
        src={post.image}
        alt={post.title}
        className="w-full h-48 object-cover"
      />

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Badge className="mb-2 bg-pink-500 text-white">{post.category}</Badge>
          <h3 className="text-lg font-bold text-gray-800 mb-2">{post.title}</h3>
          <p className="text-gray-600 text-sm">{post.excerpt}</p>
        </div>

        <div className="mt-4 text-sm text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(post.date).toLocaleDateString("fr-FR")}</span>
          </div>
        </div>

        <Button variant="link" className="mt-4 text-pink-600 p-0">
          Lire l'article →
        </Button>
      </div>
    </div>
  );
};

export default BlogCard;
