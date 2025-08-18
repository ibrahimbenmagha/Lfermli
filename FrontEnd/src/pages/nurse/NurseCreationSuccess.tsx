import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const NurseCreationSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/90 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Confirmation de création
              </h1>
              <p className="text-gray-600 mt-1">Compte infirmier créé avec succès</p>
            </div>
          </div>
        </div>
      </header>

      <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg max-w-lg mx-auto">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            Compte créé
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-lg font-medium text-gray-800 mb-4">
            Votre compte a été bien créé.
          </p>
          <p className="text-gray-600 mb-2">
            Veuillez contacter le support pour l'activer :
          </p>
          <p className="text-blue-600 font-semibold text-lg">
            +212 629-778723
          </p>
          <div className="mt-6">
            <Button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              Retour à la page d'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NurseCreationSuccess;