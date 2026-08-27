import React from 'react';
import { Clock, ShieldAlert, ArrowRight, Construction } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

const UpcomingFeaturePlaceholder = ({
  featureName = 'Feature',
  targetPhase = 'Phase 5',
  prerequisite = 'User Application Submission (Phase 5)',
  description = 'This feature is part of the FinSure phase-by-phase build roadmap and will be activated once its prerequisite phase is completed.',
}) => {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 p-8 text-center space-y-6 shadow-lg">
        <div className="w-16 h-16 bg-blue-100 text-blue-900 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-blue-200">
          <Construction className="w-8 h-8 text-blue-800" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full border border-amber-300">
            <Clock className="w-3.5 h-3.5" /> Scheduled for {targetPhase}
          </span>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{featureName}</h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">{description}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-left text-xs space-y-2 shadow-xs">
          <div className="font-bold text-slate-700 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-blue-600" /> Roadmap Activation Trigger:
          </div>
          <p className="text-slate-600 font-medium">
            This module will automatically activate after completing <strong className="text-blue-900">{prerequisite}</strong>.
          </p>
        </div>

        <div className="pt-2">
          <Link to="/dashboard">
            <Button variant="outline" className="inline-flex items-center gap-2">
              Return to Dashboard <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default UpcomingFeaturePlaceholder;
