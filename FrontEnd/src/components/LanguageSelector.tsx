import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const currentLangName = i18n.language?.startsWith('ar') ? 'العربية' : 'Français';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5 px-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
          <Globe className="h-4 w-4 text-primary" />
          <span>{currentLangName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem 
          onClick={() => changeLanguage('fr')}
          className={`cursor-pointer ${i18n.language === 'fr' ? 'font-semibold text-primary' : ''}`}
        >
          🇫🇷 Français
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('ar')}
          className={`cursor-pointer ${i18n.language === 'ar' ? 'font-semibold text-primary' : ''}`}
        >
          🇲🇦 العربية
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
