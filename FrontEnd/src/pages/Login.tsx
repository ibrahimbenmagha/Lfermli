import { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, User, Settings, LucideIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { message } from 'antd';
import axiosInstance from '../axiosConfig';
import { AxiosError } from 'axios';

interface FormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  userType: string;
  title: string;
  icon: LucideIcon;
  formData: FormData;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleLogin: (userType: string) => void;
  loading: boolean;
}

const LoginForm = ({ userType, title, icon: Icon, formData, handleInputChange, handleLogin, loading }: LoginFormProps) => (
  <Card className="w-full max-w-md mx-auto">
    <CardHeader className="text-center">
      <div className="w-16 h-16 bg-gradient-medical rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <CardTitle className="text-2xl">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="votre@email.com"
          value={formData.email}
          onChange={handleInputChange}
          disabled={loading}
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
          disabled={loading}
        />
      </div>
      <Button
        className="w-full bg-primary hover:bg-primary-600"
        onClick={() => handleLogin(userType)}
        disabled={loading}
      >
        {loading ? 'Connexion en cours...' : 'Se connecter'}
      </Button>
      <div className="text-center space-y-2">
        <Link to="/forgot-password" className="text-sm text-primary hover:underline">
          Mot de passe oublié ?
        </Link>
        <p className="text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link to="/RegisterPatient" className="text-primary hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </CardContent>
  </Card>
);

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (userType: string) => {
    setLoading(true);
    try {
      // Déterminer l'endpoint en fonction du userType
      const endpoint = `/auth/login${userType}`;
      const response = await axiosInstance.post(endpoint, {
        email: formData.email,
        password: formData.password,
      });

      const { role } = response.data;
      switch (role) {
        case 'patient':
          navigate('/patient/dashboard');
          break;
        case 'nurse':
          navigate('/nurse/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          message.error('Rôle utilisateur non reconnu');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      const errorMessage = axiosError.response?.data?.error || 'Une erreur s\'est produite lors de la connexion';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-4xl font-bold mb-2">Connexion</h1>
          <p className="text-xl text-gray-600">Accédez à votre espace personnel</p>
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
              formData={formData}
              handleInputChange={handleInputChange}
              handleLogin={handleLogin}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="nurse">
            <LoginForm
              userType="nurse"
              title="Espace Infirmière"
              icon={Heart}
              formData={formData}
              handleInputChange={handleInputChange}
              handleLogin={handleLogin}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="admin">
            <LoginForm
              userType="admin"
              title="Administration"
              icon={Settings}
              formData={formData}
              handleInputChange={handleInputChange}
              handleLogin={handleLogin}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;