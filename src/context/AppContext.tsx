import React, { createContext, useContext } from 'react';
import { ISOStandard, Advisor, Quotation, BankAccount, CertificationStep } from '@/types/quotation';
import {
  useISOStandards,
  useAdvisors,
  useBankAccounts,
  useCertificationSteps,
  useQuotations,
} from '@/hooks/useSupabaseData';

interface AppContextType {
  isoStandards: ISOStandard[];
  setIsoStandards: React.Dispatch<React.SetStateAction<ISOStandard[]>>;
  advisors: Advisor[];
  setAdvisors: React.Dispatch<React.SetStateAction<Advisor[]>>;
  quotations: Quotation[];
  setQuotations: React.Dispatch<React.SetStateAction<Quotation[]>>;
  bankAccounts: BankAccount[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  certificationSteps: CertificationStep[];
  setCertificationSteps: React.Dispatch<React.SetStateAction<CertificationStep[]>>;
  addISOStandard: (iso: ISOStandard) => Promise<void>;
  updateISOStandard: (iso: ISOStandard) => Promise<void>;
  deleteISOStandard: (id: string) => Promise<void>;
  addAdvisor: (advisor: Advisor) => Promise<void>;
  updateAdvisor: (advisor: Advisor) => Promise<void>;
  deleteAdvisor: (id: string) => Promise<void>;
  addQuotation: (quotation: Quotation) => Promise<void>;
  getNextQuotationCode: (fecha: Date) => Promise<string>;
  deleteQuotation: (id: string) => Promise<void>;
  addBankAccount: (bank: BankAccount) => Promise<void>;
  updateBankAccount: (bank: BankAccount) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
  addCertificationStep: (step: CertificationStep) => Promise<void>;
  updateCertificationStep: (step: CertificationStep) => Promise<void>;
  deleteCertificationStep: (id: string) => Promise<void>;
  reorderCertificationSteps: (steps: CertificationStep[]) => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isoStandards,
    setIsoStandards,
    loading: isoLoading,
    addISOStandard: addISO,
    updateISOStandard: updateISO,
    deleteISOStandard: deleteISO,
  } = useISOStandards();

  const {
    advisors,
    setAdvisors,
    loading: advisorsLoading,
    addAdvisor: addAdv,
    updateAdvisor: updateAdv,
    deleteAdvisor: deleteAdv,
  } = useAdvisors();

  const {
    bankAccounts,
    setBankAccounts,
    loading: banksLoading,
    addBankAccount: addBank,
    updateBankAccount: updateBank,
    deleteBankAccount: deleteBank,
  } = useBankAccounts();

  const {
    certificationSteps,
    setCertificationSteps,
    loading: stepsLoading,
    addCertificationStep: addStep,
    updateCertificationStep: updateStep,
    deleteCertificationStep: deleteStep,
    reorderCertificationSteps: reorderSteps,
  } = useCertificationSteps();

  const {
    quotations,
    setQuotations,
    loading: quotationsLoading,
    addQuotation: addQuot,
    deleteQuotation: deleteQuot,
    getNextQuotationCode: getNextCode,
  } = useQuotations();

  const loading = isoLoading || advisorsLoading || banksLoading || stepsLoading || quotationsLoading;

  // Wrapper functions to match expected interface
  const addISOStandard = async (iso: ISOStandard) => {
    await addISO(iso);
  };

  const updateISOStandard = async (iso: ISOStandard) => {
    await updateISO(iso);
  };

  const deleteISOStandard = async (id: string) => {
    await deleteISO(id);
  };

  const addAdvisor = async (advisor: Advisor) => {
    await addAdv(advisor);
  };

  const updateAdvisor = async (advisor: Advisor) => {
    await updateAdv(advisor);
  };

  const deleteAdvisor = async (id: string) => {
    await deleteAdv(id);
  };

  const addQuotation = async (quotation: Quotation) => {
    await addQuot(quotation);
  };

  const deleteQuotation = async (id: string) => {
    await deleteQuot(id);
  };

  const getNextQuotationCode = async (fecha: Date): Promise<string> => {
    return await getNextCode(fecha);
  };

  const addBankAccount = async (bank: BankAccount) => {
    await addBank(bank);
  };

  const updateBankAccount = async (bank: BankAccount) => {
    await updateBank(bank);
  };

  const deleteBankAccount = async (id: string) => {
    await deleteBank(id);
  };

  const addCertificationStep = async (step: CertificationStep) => {
    await addStep(step);
  };

  const updateCertificationStep = async (step: CertificationStep) => {
    await updateStep(step);
  };

  const deleteCertificationStep = async (id: string) => {
    await deleteStep(id);
  };

  const reorderCertificationSteps = async (steps: CertificationStep[]) => {
    await reorderSteps(steps);
  };

  return (
    <AppContext.Provider
      value={{
        isoStandards,
        setIsoStandards,
        advisors,
        setAdvisors,
        quotations,
        setQuotations,
        bankAccounts,
        setBankAccounts,
        certificationSteps,
        setCertificationSteps,
        addISOStandard,
        updateISOStandard,
        deleteISOStandard,
        addAdvisor,
        updateAdvisor,
        deleteAdvisor,
        addQuotation,
        getNextQuotationCode,
        deleteQuotation,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        addCertificationStep,
        updateCertificationStep,
        deleteCertificationStep,
        reorderCertificationSteps,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
