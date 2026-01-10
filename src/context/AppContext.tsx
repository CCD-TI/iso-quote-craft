import React, { createContext, useContext, useState, useEffect } from 'react';
import { ISOStandard, Advisor, Quotation, BankAccount, CertificationStep } from '@/types/quotation';
import { initialISOStandards, initialAdvisors, initialBankAccounts, initialCertificationSteps } from '@/data/initialData';

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
  addISOStandard: (iso: ISOStandard) => void;
  updateISOStandard: (iso: ISOStandard) => void;
  deleteISOStandard: (id: string) => void;
  addAdvisor: (advisor: Advisor) => void;
  updateAdvisor: (advisor: Advisor) => void;
  deleteAdvisor: (id: string) => void;
  addQuotation: (quotation: Quotation) => void;
  getNextQuotationCode: (year: number, month: string) => string;
  addBankAccount: (bank: BankAccount) => void;
  updateBankAccount: (bank: BankAccount) => void;
  deleteBankAccount: (id: string) => void;
  addCertificationStep: (step: CertificationStep) => void;
  updateCertificationStep: (step: CertificationStep) => void;
  deleteCertificationStep: (id: string) => void;
  reorderCertificationSteps: (steps: CertificationStep[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isoStandards, setIsoStandards] = useState<ISOStandard[]>(() => {
    const saved = localStorage.getItem('isoStandards');
    return saved ? JSON.parse(saved) : initialISOStandards;
  });

  const [advisors, setAdvisors] = useState<Advisor[]>(() => {
    const saved = localStorage.getItem('advisors');
    return saved ? JSON.parse(saved) : initialAdvisors;
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem('quotations');
    return saved ? JSON.parse(saved) : [];
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('bankAccounts');
    return saved ? JSON.parse(saved) : initialBankAccounts;
  });

  const [certificationSteps, setCertificationSteps] = useState<CertificationStep[]>(() => {
    const saved = localStorage.getItem('certificationSteps');
    return saved ? JSON.parse(saved) : initialCertificationSteps;
  });

  useEffect(() => {
    localStorage.setItem('isoStandards', JSON.stringify(isoStandards));
  }, [isoStandards]);

  useEffect(() => {
    localStorage.setItem('advisors', JSON.stringify(advisors));
  }, [advisors]);

  useEffect(() => {
    localStorage.setItem('quotations', JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem('bankAccounts', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem('certificationSteps', JSON.stringify(certificationSteps));
  }, [certificationSteps]);

  const addISOStandard = (iso: ISOStandard) => {
    setIsoStandards((prev) => [...prev, iso]);
  };

  const updateISOStandard = (iso: ISOStandard) => {
    setIsoStandards((prev) =>
      prev.map((item) => (item.id === iso.id ? iso : item))
    );
  };

  const deleteISOStandard = (id: string) => {
    setIsoStandards((prev) => prev.filter((item) => item.id !== id));
  };

  const addAdvisor = (advisor: Advisor) => {
    setAdvisors((prev) => [...prev, advisor]);
  };

  const updateAdvisor = (advisor: Advisor) => {
    setAdvisors((prev) =>
      prev.map((item) => (item.id === advisor.id ? advisor : item))
    );
  };

  const deleteAdvisor = (id: string) => {
    setAdvisors((prev) => prev.filter((item) => item.id !== id));
  };

  const addQuotation = (quotation: Quotation) => {
    setQuotations((prev) => [...prev, quotation]);
  };

  const getNextQuotationCode = (year: number, month: string): string => {
    const prefix = `COT-${year}-${month}-`;
    const existingCodes = quotations
      .filter((q) => q.code.startsWith(prefix))
      .map((q) => parseInt(q.code.split('-').pop() || '0', 10));
    const nextNumber = existingCodes.length > 0 ? Math.max(...existingCodes) + 1 : 1;
    return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  };

  const addBankAccount = (bank: BankAccount) => {
    setBankAccounts((prev) => [...prev, bank]);
  };

  const updateBankAccount = (bank: BankAccount) => {
    setBankAccounts((prev) =>
      prev.map((item) => (item.id === bank.id ? bank : item))
    );
  };

  const deleteBankAccount = (id: string) => {
    setBankAccounts((prev) => prev.filter((item) => item.id !== id));
  };

  const addCertificationStep = (step: CertificationStep) => {
    setCertificationSteps((prev) => [...prev, step]);
  };

  const updateCertificationStep = (step: CertificationStep) => {
    setCertificationSteps((prev) =>
      prev.map((item) => (item.id === step.id ? step : item))
    );
  };

  const deleteCertificationStep = (id: string) => {
    setCertificationSteps((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      // Reorder after deletion
      return filtered.map((step, index) => ({ ...step, order: index + 1 }));
    });
  };

  const reorderCertificationSteps = (steps: CertificationStep[]) => {
    setCertificationSteps(steps);
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
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        addCertificationStep,
        updateCertificationStep,
        deleteCertificationStep,
        reorderCertificationSteps,
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
