import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { OverviewPage } from '@/features/overview/OverviewPage';
import { ShortageRadarPage } from '@/features/radar/ShortageRadarPage';
import { DecisionCenterPage } from '@/features/decisionCenter/DecisionCenterPage';
import { CampaignStudioPage } from '@/features/campaignStudio/CampaignStudioPage';
import { BloodBanksPage } from '@/features/bloodBanks/BloodBanksPage';
import { HospitalRequestsPage } from '@/features/hospitalRequests/HospitalRequestsPage';
import { DonorNetworkPage } from '@/features/donorNetwork/DonorNetworkPage';
import { DataIngestionPage } from '@/features/dataIngestion/DataIngestionPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/radar" element={<ShortageRadarPage />} />
        <Route path="/decision-center" element={<DecisionCenterPage />} />
        <Route path="/campaign-studio" element={<CampaignStudioPage />} />
        <Route path="/blood-banks" element={<BloodBanksPage />} />
        <Route path="/requests" element={<HospitalRequestsPage />} />
        <Route path="/donor-network" element={<DonorNetworkPage />} />
        <Route path="/data-ingestion" element={<DataIngestionPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
