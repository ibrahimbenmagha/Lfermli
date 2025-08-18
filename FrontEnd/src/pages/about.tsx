import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Heart, Shield, Clock, Users, Award, Target, Eye, Star, ArrowRight, CheckCircle, Play, Video, Image } from 'lucide-react';

const About = () => {
  const stats = [
    { number: "500+", label: "Patients satisfaits", icon: Users },
    { number: "50+", label: "Infirmières qualifiées", icon: Award },
    { number: "24/7", label: "Disponibilité", icon: Clock },
    { number: "98%", label: "Taux de satisfaction", icon: Star }
  ];

  const values = [
    {
      icon: Heart,
      title: "Bienveillance",
      description: "Nous plaçons l'humain au cœur de nos préoccupations avec empathie et respect.",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop"
    },
    {
      icon: Shield,
      title: "Sécurité",
      description: "Des soins de qualité dans un environnement sécurisé et confidentiel.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop"
    },
    {
      icon: Target,
      title: "Excellence",
      description: "Un engagement constant vers l'amélioration de nos services et pratiques.",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=300&fit=crop"
    },
    {
      icon: Users,
      title: "Proximité",
      description: "Un accompagnement personnalisé adapté aux besoins de chaque patient.",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop"
    }
  ];

  const team = [
    {
      name: "Dr. Marie Laurent",
      role: "Directrice Médicale",
      description: "15 ans d'expérience en soins infirmiers",
      image: "https://images.unsplash.com/photo-1594824020049-957a68ba2cf8?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Sophie Martin",
      role: "Responsable Qualité",
      description: "Spécialiste en organisation des soins",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Jean Dubois",
      role: "Directeur Technique",
      description: "Expert en solutions de santé digitales",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
    }
  ];

  const achievements = [
    "Certification ISO 9001 pour la qualité des soins",
    "Agrément Sécurité Sociale",
    "Partenariat avec les hôpitaux de la région",
    "Formation continue de nos équipes",
    "Respect des normes RGPD",
    "Support 24h/24 et 7j/7"
  ];

  const videoTestimonials = [
    {
      title: "Témoignage de Marie, 78 ans",
      description: "Découvrez l'expérience de Marie avec nos soins à domicile",
      thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=225&fit=crop",
      duration: "2:30"
    },
    {
      title: "Formation de nos infirmières",
      description: "Un aperçu de notre programme de formation continue",
      thumbnail: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=225&fit=crop",
      duration: "3:45"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-light">
      {/* Hero Section with Video Background */}
      <section className="relative bg-gradient-medical text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-r from-primary/80 to-secondary/80"></div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full transform -translate-x-16 translate-y-16"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold mb-2">À propos de Lfermli</h1>
                  <p className="text-xl opacity-90">Votre partenaire santé à domicile</p>
                </div>
              </div>
              <p className="text-xl mb-8 leading-relaxed">
                Pionniers des soins infirmiers à domicile, nous révolutionnons l'accès aux soins de santé 
                en combinant expertise médicale, technologie moderne et proximité humaine.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  <Eye className="w-5 h-5 mr-2" />
                  Notre Mission
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  <Users className="w-5 h-5 mr-2" />
                  Rencontrer l'équipe
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6">
                <AspectRatio ratio={16 / 9}>
                  <div className="relative w-full h-full bg-black/20 rounded-2xl overflow-hidden group cursor-pointer">
                    <img 
                      src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop"
                      alt="Soins infirmiers à domicile"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-semibold">Présentation Lfermli</p>
                      <p className="text-sm opacity-80">3:25 min</p>
                    </div>
                  </div>
                </AspectRatio>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-medical rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">{stat.number}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section with Images */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                <Target className="w-4 h-4 mr-2" />
                Notre Mission
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Rendre les soins de qualité accessibles à domicile
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Lfermli a été créé avec la conviction que chaque personne mérite d'accéder à des soins 
                infirmiers de qualité dans le confort de son domicile. Nous connectons des professionnels 
                de santé qualifiés avec des patients ayant besoin de soins personnalisés.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-secondary mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Soins infirmiers professionnels et personnalisés</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-secondary mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Technologie innovante pour une meilleure coordination</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-secondary mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">Accompagnement humain et bienveillant</p>
                </div>
              </div>
              
              {/* Image Gallery */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group cursor-pointer">
                  <img 
                    src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop"
                    alt="Soins à domicile"
                    className="w-full h-32 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-medical/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="relative group cursor-pointer">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=200&fit=crop"
                    alt="Équipe médicale"
                    className="w-full h-32 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-medical/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-medical rounded-3xl p-8 text-white">
                <Eye className="w-12 h-12 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Notre Vision</h3>
                <p className="text-lg leading-relaxed mb-6">
                  Devenir la référence européenne des soins infirmiers à domicile en alliant 
                  innovation technologique et excellence médicale pour améliorer la qualité 
                  de vie de nos patients.
                </p>
                <AspectRatio ratio={16 / 9} className="rounded-2xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=500&h=300&fit=crop"
                    alt="Innovation en santé"
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/20 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/20 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section with Images */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Nos Valeurs</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des principes fondamentaux qui guident chacune de nos actions et définissent notre approche des soins.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 border-0 shadow-lg group overflow-hidden">
                  <div className="relative">
                    <AspectRatio ratio={4 / 3}>
                      <img 
                        src={value.image}
                        alt={value.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </AspectRatio>
                    <div className="absolute inset-0 bg-gradient-medical/60 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Témoignages Vidéo</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les histoires inspirantes de nos patients et l'expertise de notre équipe.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {videoTestimonials.map((video, index) => (
              <Card key={index} className="group cursor-pointer hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="relative">
                  <AspectRatio ratio={16 / 9}>
                    <img 
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </AspectRatio>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-black/60 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white px-2 py-1 rounded">
                    <Video className="w-4 h-4 inline mr-1" />
                    Vidéo
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{video.title}</CardTitle>
                  <CardDescription>{video.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section with Photos */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Notre Équipe</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des professionnels passionnés et expérimentés dédiés à votre bien-être.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg group overflow-hidden">
                <div className="relative">
                  <AspectRatio ratio={1}>
                    <img 
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </AspectRatio>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">{member.name}</CardTitle>
                  <CardDescription className="text-secondary font-semibold">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Galerie Photos</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un aperçu de notre environnement de travail et de nos services.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=300&fit=crop", alt: "Soins à domicile" },
              { src: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=300&h=300&fit=crop", alt: "Formation" },
              { src: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop", alt: "Consultation" },
              { src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=300&fit=crop", alt: "Équipe" },
              { src: "https://images.unsplash.com/photo-1594824020049-957a68ba2cf8?w=300&h=300&fit=crop", alt: "Professionnelle" },
              { src: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop", alt: "Spécialiste" },
              { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop", alt: "Innovation" },
              { src: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop", alt: "Technologie" }
            ].map((photo, index) => (
              <div key={index} className="relative group cursor-pointer overflow-hidden rounded-lg">
                <AspectRatio ratio={1}>
                  <img 
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </AspectRatio>
                <div className="absolute inset-0 bg-gradient-medical/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Image className="w-8 h-8 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Nos Engagements</h2>
              <p className="text-lg text-gray-600 mb-8">
                Nous nous engageons à maintenir les plus hauts standards de qualité et de sécurité 
                dans tous nos services.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 text-center">
                <Award className="w-16 h-16 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Certification Qualité</h3>
                <p className="text-gray-600 mb-6">
                  Nos services sont certifiés et respectent les normes les plus strictes du secteur médical.
                </p>
                <Button className="bg-secondary hover:bg-secondary-600 text-white">
                  Voir nos certifications
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-medical text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Rejoignez la famille Lfermli</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Que vous soyez un patient cherchant des soins de qualité ou un professionnel de santé 
            souhaitant faire la différence, nous vous accueillons avec bienveillance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
              <Users className="w-5 h-5 mr-2" />
              Devenir patient
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              <Heart className="w-5 h-5 mr-2" />
              Rejoindre notre équipe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;