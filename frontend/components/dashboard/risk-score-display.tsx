'use client'

import React from 'react';

interface RiskScore {
  score: number;
  justification: string;
}

interface RiskData {
  cardiovascular: RiskScore;
  diabetes: RiskScore;
  liver: RiskScore;
}

interface RiskScoreDisplayProps {
  riskData: RiskData;
}

const Gauge = ({ score, label }: { score: number; label: string }) => {
  const getRiskColor = (s: number) => {
    if (s < 33) return 'text-green-500';
    if (s < 66) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="text-center p-4 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className={`text-5xl font-black ${getRiskColor(score)}`}>
        {score}%
      </div>
      <div className="text-xl font-black uppercase tracking-wide mt-2">{label}</div>
    </div>
  );
};

export default function RiskScoreDisplay({ riskData }: RiskScoreDisplayProps) {
  if (!riskData) return null;

  return (
    <div className="p-6 mb-6 border-4 border-black bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-2xl font-black text-black mb-4 uppercase tracking-wide">Personalized Risk Assessment</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <Gauge score={riskData.cardiovascular.score} label="Cardiovascular" />
        <Gauge score={riskData.diabetes.score} label="Diabetes" />
        <Gauge score={riskData.liver.score} label="Liver Health" />
      </div>
      <div className="space-y-2">
        <p><strong className="font-black bg-black text-white px-1">Cardio Justification:</strong> {riskData.cardiovascular.justification}</p>
        <p><strong className="font-black bg-black text-white px-1">Diabetes Justification:</strong> {riskData.diabetes.justification}</p>
        <p><strong className="font-black bg-black text-white px-1">Liver Justification:</strong> {riskData.liver.justification}</p>
      </div>
    </div>
  );
}