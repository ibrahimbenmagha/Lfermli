import './home.css';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, User, Calendar, Search, Home as HomeIcon, ShieldCheck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SOSButtonModal from '@/components/SOSButtonModal';
import NurseMap from '@/components/NurseMap';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const services = [
    {
      title: "Soins à domicile",
      description: "Soins infirmiers professionnels dans le confort de votre domicile",
      icon: HomeIcon,
    },
    {
      title: "Consultation spécialisée",
      description: "Accès à des infirmières spécialisées selon vos besoins",
      icon: User,
    },
    {
      title: "Urgences 24h/24",
      description: "Service d'urgence disponible à tout moment",
      icon: Heart,
    },
    {
      title: "Suivi personnalisé",
      description: "Suivi médical et constantes vitales adaptés à votre situation",
      icon: Calendar,
    },
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      text: "Service exceptionnel ! L'infirmière était très professionnelle et attentionnée.",
      rating: 5,
    },
    {
      name: "Yassine El Amrani",
      text: "Très pratique pour mes soins post-opératoires à Casablanca. Je recommande vivement !",
      rating: 5,
    },
    {
      name: "Khadija Benali",
      text: "L'équipe Lfermli a pris soin de mon père avec beaucoup de bienveillance et ponctualité.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen" id="img">
      {/* Floating SOS button for rapid mobile / desktop emergency */}
      <SOSButtonModal variant="floating" />

      {/* Hero Section */}
      <section className="bg-gradient-light py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full mb-6">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>{t('verification.badge', 'Infirmiers 100% Certifiés & Vérifiés')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight">
              <span className="bg-gradient-medical bg-clip-text text-transparent">
                {t('hero.title_part1', 'Soins infirmiers')}
              </span>
              <br />
              {t('hero.title_part2', 'à domicile de qualité')}
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t(
                'hero.subtitle',
                'Connectez-vous avec des infirmiers qualifiés pour recevoir des soins professionnels dans le confort de votre domicile, 24h/24 et 7j/7.'
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3.5 text-base font-bold rounded-xl shadow-lg hover:shadow-teal-500/20 transition-all w-full sm:w-auto"
                onClick={() => navigate('/login')}
              >
                <Calendar className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('hero.book_now', 'Réserver maintenant')}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3.5 text-base font-semibold rounded-xl w-full sm:w-auto"
                onClick={() => navigate('/services')}
              >
                {t('hero.discover_services', 'Découvrir nos services')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-16 bg-slate-50 border-y border-slate-200/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
              <MapPin className="h-7 w-7 text-teal-600" />
              <span>{t('map.title', 'Trouvez un infirmier près de chez vous')}</span>
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              {t('map.subtitle', 'Visualisez en temps réel les praticiens disponibles autour de vous.')}
            </p>
          </div>

          <NurseMap />
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Nos Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Des soins adaptés à vos besoins, dispensés par des professionnels qualifiés
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-slate-200/80 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-medical rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-800">{service.title}</h3>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gradient-light">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Comment ça marche ?</h2>
            <p className="text-lg text-gray-600">Simple, rapide et sécurisé en 3 étapes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100 font-black text-xl">
                1
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800">Recherchez</h3>
              <p className="text-gray-600 text-sm">
                Trouvez l'infirmière certifiée qui correspond à vos besoins près de chez vous
              </p>
            </div>
            <div className="text-center bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100 font-black text-xl">
                2
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800">Réservez</h3>
              <p className="text-gray-600 text-sm">
                Choisissez votre créneau horaire et confirmez votre rendez-vous en quelques clics
              </p>
            </div>
            <div className="text-center bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100 font-black text-xl">
                3
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800">Recevez vos soins</h3>
              <p className="text-gray-600 text-sm">
                Profitez de soins professionnels et du suivi de vos constantes dans le confort de votre domicile
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Témoignages</h2>
            <p className="text-lg text-gray-600">Ce que disent nos patients</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-slate-200/80 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4 text-amber-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Heart key={i} className="h-5 w-5 fill-current text-rose-500" />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-4 italic text-sm">"{testimonial.text}"</p>
                  <p className="font-bold text-slate-900">{testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-medical text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Prêt à recevoir vos soins ?</h2>
          <p className="text-lg mb-8 opacity-90">
            Rejoignez des milliers de patients et infirmiers au Maroc
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-teal-800 hover:bg-slate-100 px-8 py-3.5 text-base font-bold rounded-xl border-white shadow-md"
              onClick={() => navigate('/RegisterPatient')}
            >
              Créer mon compte patient
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white hover:bg-white hover:text-teal-800 px-8 py-3.5 text-base font-bold rounded-xl border-white"
              onClick={() => navigate('/RegisterNurse')}
            >
              Devenir infirmier partenaire
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
