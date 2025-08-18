
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, User, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const inscription = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''

  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = (userType: 'patient' | 'nurse' | 'admin') => {
    console.log('Login attempt:', { userType, ...formData });
    
    // Simulate login success and redirect to appropriate dashboard
    switch (userType) {
      case 'patient':
        navigate('/patient/dashboard');
        break;
      case 'nurse':
        navigate('/nurse/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
    }
  };

  const LoginForm = ({ userType, title, icon: Icon }: { 
    userType: 'patient' | 'nurse' | 'admin', 
    title: string, 
    icon: any 
  }) => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-medical rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
      <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            name="name"
            type="name"
            placeholder="nom_utilisateur"

            value={formData.name}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="votre@email.com"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>





        <Button 
          className="w-full bg-primary hover:bg-primary-600"
          onClick={() => handleLogin(userType)}
        >
          Se connecter
        </Button>
        <div className="text-center space-y-2">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Mot de passe oublié ?
          </Link>
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-light py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-gradient-medical rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-medical bg-clip-text text-transparent">
              Lfermli
            </span>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Inscription</h1>
          <p className="text-xl text-gray-600">Creer votre espace personnel</p>
        </div>

        <Tabs defaultValue="patient" className="w-full max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="patient" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Patient</span>
            </TabsTrigger>
            <TabsTrigger value="nurse" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Infirmière</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patient">
            <LoginForm 
              userType="patient" 
              title="Espace Patient" 
              icon={User}
            />
          </TabsContent>

          <TabsContent value="nurse">
            <LoginForm 
              userType="nurse" 
              title="Espace Infirmière" 
              icon={Heart}
            />
          </TabsContent>

          <TabsContent value="admin">
            <LoginForm 
              userType="admin" 
              title="Administration" 
              icon={Settings}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default inscription;
