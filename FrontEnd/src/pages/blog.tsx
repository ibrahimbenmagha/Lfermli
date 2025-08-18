import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight, Search, Filter } from 'lucide-react';
import BlogCard from '@/components/BlogCard';
import BlogCategories from '@/components/BlogCategories';

// Articles de blog avec photos
const blogPosts = [
  {
    id: 1,
    title: "Les soins infirmiers à domicile : une révolution dans le secteur de la santé",
    excerpt: "Découvrez comment les soins à domicile transforment l'expérience patient et améliorent l'accès aux soins de santé.",
    content: "Les soins infirmiers à domicile représentent une évolution majeure dans notre approche des soins de santé...",
    author: "Dr. Marie Dubois",
    date: "2024-01-15",
    category: "Soins à domicile",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    readTime: "5 min",
    tags: ["santé", "innovation", "domicile"]
  },
  {
    id: 2,
    title: "L'importance de la formation continue pour les infirmières",
    excerpt: "Comment la formation continue améliore la qualité des soins et maintient l'excellence professionnelle.",
    content: "Dans un secteur en constante évolution, la formation continue des infirmières est essentielle...",
    author: "Infirmière Sophie Martin",
    date: "2024-01-10",
    category: "Formation",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    readTime: "7 min",
    tags: ["formation", "compétences", "qualité"]
  },
  {
    id: 3,
    title: "Technologies numériques et soins infirmiers : l'avenir est maintenant",
    excerpt: "Exploration des nouvelles technologies qui révolutionnent les pratiques infirmières modernes.",
    content: "Les technologies numériques transforment radicalement la façon dont nous dispensons les soins...",
    author: "Dr. Pierre Leclerc",
    date: "2024-01-05",
    category: "Technologie",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    readTime: "6 min",
    tags: ["technologie", "innovation", "futur"]
  },
  {
    id: 4,
    title: "Gestion du stress et bien-être des soignants",
    excerpt: "Stratégies et conseils pour maintenir un équilibre de vie sain dans le secteur des soins.",
    content: "Le bien-être des soignants est crucial pour la qualité des soins dispensés aux patients...",
    author: "Psychologue Dr. Anne Rousseau",
    date: "2023-12-28",
    category: "Bien-être",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    readTime: "8 min",
    tags: ["bien-être", "stress", "équilibre"]
  },
  {
    id: 5,
    title: "Prévention et soins préventifs : un enjeu majeur de santé publique",
    excerpt: "Comment les soins préventifs peuvent réduire les coûts de santé et améliorer la qualité de vie.",
    content: "La prévention est la clé d'un système de santé durable et efficace...",
    author: "Dr. Jean Moreau",
    date: "2023-12-20",
    category: "Prévention",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    readTime: "5 min",
    tags: ["prévention", "santé publique", "qualité de vie"]
  },
  {
    id: 6,
    title: "Communication patient-soignant : clés d'une relation de confiance",
    excerpt: "L'art de la communication dans les soins : techniques et bonnes pratiques pour une relation thérapeutique optimale.",
    content: "Une communication efficace est le fondement d'une relation de soin de qualité...",
    author: "Infirmière Claire Durand",
    date: "2023-12-15",
    category: "Communication",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    readTime: "6 min",
    tags: ["communication", "relation", "confiance"]
  }
];

const categories = [
  "Tous",
  "Soins à domicile",
  "Formation",
  "Technologie",
  "Bien-être",
  "Prévention",
  "Communication"
];

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "Tous" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts[0];

  return (
    <div className="min-h-screen bg-gradient-light">
      {/* Hero Section with Background Image */}
      <section 
        className="relative text-white py-20 min-h-[60vh] flex items-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">
            Blog Lfermli
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto animate-fade-in">
            Découvrez les dernières actualités, conseils et innovations dans le domaine des soins infirmiers et de la santé à domicile.
          </p>
          <div className="flex justify-center items-center space-x-4 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-lg text-gray-800 w-80 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Article en vedette */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Article en vedette</h2>
          <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <Badge className="mb-4 bg-primary text-white">
                  {featuredPost.category}
                </Badge>
                <h3 className="text-2xl font-bold mb-4">{featuredPost.title}</h3>
                <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {featuredPost.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(featuredPost.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <Button className="bg-secondary hover:bg-secondary-600">
                    Lire l'article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Catégories */}
        <BlogCategories 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Grille d'articles */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              {selectedCategory === "Tous" ? "Tous les articles" : `Articles - ${selectedCategory}`}
            </h2>
            <div className="flex items-center space-x-2 text-gray-600">
              <Filter className="h-5 w-5" />
              <span>{filteredPosts.length} article(s)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Restez informé</h3>
          <p className="text-gray-600 mb-6">
            Abonnez-vous à notre newsletter pour recevoir les derniers articles et actualités du secteur de la santé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="bg-primary hover:bg-primary-600">
              S'abonner
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Blog;