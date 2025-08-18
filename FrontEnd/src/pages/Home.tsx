import './home.css'
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, User, Calendar, Search, Settings, Home as HomeIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "Soins à domicile",
      description: "Soins infirmiers professionnels dans le confort de votre domicile",
      icon: HomeIcon
    },
    {
      title: "Consultation spécialisée",
      description: "Accès à des infirmières spécialisées selon vos besoins",
      icon: User
    },
    {
      title: "Urgences 24h/24",
      description: "Service d'urgence disponible à tout moment",
      icon: Heart
    },
    {
      title: "Suivi personnalisé",
      description: "Suivi médical adapté à votre situation",
      icon: Calendar
    }
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      text: "Service exceptionnel ! L'infirmière était très professionnelle et attentionnée.",
      rating: 5
    },
    {
      name: "Jean Martin",
      text: "Très pratique pour mes soins post-opératoires. Je recommande vivement !",
      rating: 5
    },
    {
      name: "Sophie Laurent",
      text: "L'équipe Lfermli a pris soin de ma mère avec beaucoup de bienveillance.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen" id='img'>
      {/* Hero Section */}
      <section    className="bg-gradient-light py-20" >
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-medical bg-clip-text text-transparent">
                Soins infirmiers
              </span>
              <br />
              à domicile de qualité
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connectez-vous avec des infirmières qualifiées pour recevoir des soins professionnels 
              dans le confort de votre domicile, 24h/24 et 7j/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button  
                size="lg" 
                className="bg-primary hover:bg-primary-600 text-white px-8 py-3 text-lg"
                onClick={() => navigate('/login')}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Réserver maintenant
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-secondary text-secondary hover:bg-secondary hover:text-white px-8 py-3 text-lg"
                onClick={() => navigate('/services')}
              >
                Découvrir nos services
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Nos Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des soins adaptés à vos besoins, dispensés par des prONCofessionnels qualifiés
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-medical rounded-full flex items-center justify-center mx-auto mb-4">
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gradient-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comment ça marche ?</h2>
            <p className="text-xl text-gray-600">Simple, rapide et sécurisé</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">1. Recherchez</h3>
              <p className="text-gray-600">
                Trouvez l'infirmière qui correspond à vos besoins près de chez vous
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">2. Réservez</h3>
              <p className="text-gray-600">
                Choisissez votre créneau et confirmez votre rendez-vous en ligne
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">3. Recevez vos soins</h3>
              <p className="text-gray-600">
                Profitez de soins de qualité dans le confort de votre domicile
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Témoignages</h2>
            <p className="text-xl text-gray-600">Ce que disent nos patients</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Heart key={i} className="h-5 w-5 text-secondary fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <p className="font-semibold text-primary">{testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-medical text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez des milliers de patients satisfaits
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="outline"
              className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg border-white"
              onClick={() => navigate('/RegisterPatient')}
            >
              Créer mon compte patient
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-transparent text-white hover:bg-white hover:text-primary px-8 py-3 text-lg border-white"
              onClick={() => navigate('/RegisterNurse')}
            >
              Devenir infirmière partenaire
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
