import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Heart, Thermometer, Droplet, Wind, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface VitalSignsData {
  blood_pressure?: string; // 120/80
  heart_rate?: number;     // 75
  blood_sugar?: number;    // 0.95
  temperature?: number;    // 37.0
  oxygen_saturation?: number; // 98
}

interface VitalSignsWidgetProps {
  vitals: VitalSignsData;
  date?: string;
  nurseName?: string;
  isForm?: boolean;
  onChange?: (key: keyof VitalSignsData, val: any) => void;
}

export const VitalSignsWidget: React.FC<VitalSignsWidgetProps> = ({
  vitals,
  date,
  nurseName,
  isForm = false,
  onChange,
}) => {
  const { t } = useTranslation();

  const getStatus = (key: keyof VitalSignsData, val: any) => {
    if (!val) return 'none';
    switch (key) {
      case 'heart_rate':
        return val >= 60 && val <= 100 ? 'normal' : 'warning';
      case 'temperature':
        return val >= 36.5 && val <= 37.8 ? 'normal' : 'warning';
      case 'oxygen_saturation':
        return val >= 95 ? 'normal' : 'warning';
      case 'blood_sugar':
        return val >= 0.7 && val <= 1.2 ? 'normal' : 'warning';
      default:
        return 'normal';
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'normal') {
      return <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">Normal</span>;
    }
    if (status === 'warning') {
      return <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">À surveiller</span>;
    }
    return null;
  };

  return (
    <Card className="border border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <span>{t('vitals.title', 'Constantes Vitales')}</span>
          </CardTitle>
          {date && <span className="text-xs text-slate-500 font-medium">{date}</span>}
        </div>
        {nurseName && (
          <p className="text-xs text-slate-500">
            Enregistré par : <span className="font-semibold text-slate-700">{nurseName}</span>
          </p>
        )}
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {/* Tension Artérielle */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">{t('vitals.blood_pressure', 'Tension')}</span>
              <Activity className="h-3.5 w-3.5 text-red-500" />
            </div>
            {isForm ? (
              <input
                type="text"
                value={vitals.blood_pressure || ''}
                onChange={(e) => onChange?.('blood_pressure', e.target.value)}
                placeholder="120/80"
                className="w-full text-sm font-bold border rounded p-1"
              />
            ) : (
              <div>
                <p className="text-base font-extrabold text-slate-800">
                  {vitals.blood_pressure || '--'} <span className="text-[10px] font-normal text-slate-500">mmHg</span>
                </p>
              </div>
            )}
          </div>

          {/* Fréquence Cardiaque */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">{t('vitals.heart_rate', 'Pouls')}</span>
              <Heart className="h-3.5 w-3.5 text-rose-500" />
            </div>
            {isForm ? (
              <input
                type="number"
                value={vitals.heart_rate || ''}
                onChange={(e) => onChange?.('heart_rate', Number(e.target.value))}
                placeholder="75"
                className="w-full text-sm font-bold border rounded p-1"
              />
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-base font-extrabold text-slate-800">
                    {vitals.heart_rate || '--'} <span className="text-[10px] font-normal text-slate-500">bpm</span>
                  </p>
                  {statusBadge(getStatus('heart_rate', vitals.heart_rate))}
                </div>
              </div>
            )}
          </div>

          {/* Glycémie */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">{t('vitals.blood_sugar', 'Glycémie')}</span>
              <Droplet className="h-3.5 w-3.5 text-blue-500" />
            </div>
            {isForm ? (
              <input
                type="number"
                step="0.01"
                value={vitals.blood_sugar || ''}
                onChange={(e) => onChange?.('blood_sugar', parseFloat(e.target.value))}
                placeholder="0.95"
                className="w-full text-sm font-bold border rounded p-1"
              />
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-base font-extrabold text-slate-800">
                    {vitals.blood_sugar || '--'} <span className="text-[10px] font-normal text-slate-500">g/L</span>
                  </p>
                  {statusBadge(getStatus('blood_sugar', vitals.blood_sugar))}
                </div>
              </div>
            )}
          </div>

          {/* Température */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">{t('vitals.temperature', 'Température')}</span>
              <Thermometer className="h-3.5 w-3.5 text-amber-500" />
            </div>
            {isForm ? (
              <input
                type="number"
                step="0.1"
                value={vitals.temperature || ''}
                onChange={(e) => onChange?.('temperature', parseFloat(e.target.value))}
                placeholder="37.0"
                className="w-full text-sm font-bold border rounded p-1"
              />
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-base font-extrabold text-slate-800">
                    {vitals.temperature || '--'} <span className="text-[10px] font-normal text-slate-500">°C</span>
                  </p>
                  {statusBadge(getStatus('temperature', vitals.temperature))}
                </div>
              </div>
            )}
          </div>

          {/* SpO2 */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">{t('vitals.spO2', 'SpO₂')}</span>
              <Wind className="h-3.5 w-3.5 text-cyan-500" />
            </div>
            {isForm ? (
              <input
                type="number"
                value={vitals.oxygen_saturation || ''}
                onChange={(e) => onChange?.('oxygen_saturation', Number(e.target.value))}
                placeholder="98"
                className="w-full text-sm font-bold border rounded p-1"
              />
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-base font-extrabold text-slate-800">
                    {vitals.oxygen_saturation || '--'} <span className="text-[10px] font-normal text-slate-500">%</span>
                  </p>
                  {statusBadge(getStatus('oxygen_saturation', vitals.oxygen_saturation))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VitalSignsWidget;
