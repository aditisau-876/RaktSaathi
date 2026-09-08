import React, { createContext, useContext, useState } from 'react';
import { ActiveShortageContext } from '@/core/types/incident';
import { ACTIVE_SHORTAGE_INCIDENT } from '@/data/mockIncidents';
import { MOCK_FACILITIES } from '@/data/mockInventory';
import { MOCK_REQUESTS } from '@/data/mockRequests';
import { FacilityInventory } from '@/core/types/inventory';
import { HospitalRequest } from '@/core/types/requests';

interface IncidentContextType {
  activeIncident: ActiveShortageContext;
  facilities: FacilityInventory[];
  requests: HospitalRequest[];
  setActiveIncident: (incident: ActiveShortageContext) => void;
  simulateRequisition: (req: Omit<HospitalRequest, 'id' | 'timestamp' | 'status'>) => void;
  executeTransfer: (units: number) => { success: boolean; message: string };
  isTransferPrimed: boolean;
  setIsTransferPrimed: (primed: boolean) => void;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeIncident, setActiveIncident] = useState<ActiveShortageContext>(ACTIVE_SHORTAGE_INCIDENT);
  const [facilities, setFacilities] = useState<FacilityInventory[]>(MOCK_FACILITIES);
  const [requests, setRequests] = useState<HospitalRequest[]>(MOCK_REQUESTS);
  const [isTransferPrimed, setIsTransferPrimed] = useState<boolean>(false);

  const simulateRequisition = (newReqData: Omit<HospitalRequest, 'id' | 'timestamp' | 'status'>) => {
    const newId = `REQ-${Math.floor(8822 + Math.random() * 100)}`;
    const newRequest: HospitalRequest = {
      ...newReqData,
      id: newId,
      timestamp: 'Just now (Simulated)',
      status: 'ANALYZING',
    };

    setRequests(prev => [newRequest, ...prev]);

    // If request matches active incident blood group (O-), worsen deficit
    if (newReqData.bloodGroup === activeIncident.bloodGroup) {
      setActiveIncident(prev => ({
        ...prev,
        currentStock: Math.max(0, prev.currentStock - newReqData.unitsRequested),
        projectedGap: prev.projectedGap - newReqData.unitsRequested,
        hoursUntilBreach: Math.max(4, prev.hoursUntilBreach - 4),
      }));
    }
  };

  const executeTransfer = (units: number) => {
    setIsTransferPrimed(true);
    setActiveIncident(prev => ({
      ...prev,
      projectedGap: Math.min(0, prev.projectedGap + units),
      currentStock: prev.currentStock + units,
      severity: prev.currentStock + units >= prev.mandatedFloor ? 'STABLE' : 'WARNING',
    }));

    return {
      success: true,
      message: `Cold-chain transfer order dispatched. ${units} units O- allocated from Noida Regional Center (Bank B) to Metro Trauma Hub (Bank A).`,
    };
  };

  return (
    <IncidentContext.Provider
      value={{
        activeIncident,
        facilities,
        requests,
        setActiveIncident,
        simulateRequisition,
        executeTransfer,
        isTransferPrimed,
        setIsTransferPrimed,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncident = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncident must be used within an IncidentProvider');
  }
  return context;
};
