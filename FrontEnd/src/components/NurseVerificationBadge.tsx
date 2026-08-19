import React from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';

interface NurseVerificationBadgeProps {
  isVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const NurseVerificationBadge: React.FC<NurseVerificationBadgeProps> = ({
  isVerified = false,
  size = 'md',
  showText = true,
}) => {
  const { t } = useTranslation();

  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
    lg: 'text-sm px-2.5 py-1 gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full shadow-xs cursor-help ${sizeClasses[size]}`}
          >
            <ShieldCheck className={`${iconSizes[size]} text-emerald-600 shrink-0`} />
            {showText && <span>{t('verification.badge', 'Vérifié & Certifié')}</span>}
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-slate-900 text-white text-xs max-w-xs p-2.5 rounded-lg shadow-lg">
          <p>{t('verification.verified_tooltip', "Diplôme d'État et carte professionnelle validés par l'administration Lfermli.")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NurseVerificationBadge;
