import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ISOStandard, Advisor, BankAccount, CertificationStep, Quotation, SelectedISO } from '@/types/quotation';

// Types for database rows
interface DbISOStandard {
  id: string;
  code: string;
  name: string;
  description: string | null;
  certification_price: number;
  follow_up_price: number;
  recertification_price: number;
  created_at: string;
  updated_at: string;
}

interface DbAdvisor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  username: string | null;
  password_hash: string | null;
  created_at: string;
  updated_at: string;
}

interface DbBankAccount {
  id: string;
  bank_name: string;
  account_holder: string;
  account_number: string;
  cci: string | null;
  currency: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

interface DbCertificationStep {
  id: string;
  step_order: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface DbQuotation {
  id: string;
  code: string;
  date: string;
  client_ruc: string | null;
  client_razon_social: string | null;
  client_representante: string | null;
  client_celular: string | null;
  client_correo: string | null;
  advisor_id: string | null;
  subtotal: number;
  igv: number;
  discount: number;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
  include_igv: boolean;
  implementation_enabled: boolean;
  implementation_company_size: string | null;
  implementation_unit_price: number;
  implementation_quantity: number;
  implementation_total: number;
}

interface DbQuotationISO {
  id: string;
  quotation_id: string;
  iso_id: string;
  certification: boolean;
  certification_price: number;
  follow_up: boolean;
  follow_up_price: number;
  recertification: boolean;
  recertification_price: number;
  created_at: string;
}

interface DbAttachedFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Mappers
const mapDbToISOStandard = (db: DbISOStandard): ISOStandard => ({
  id: db.id,
  code: db.code,
  name: db.name,
  description: db.description || '',
  certificationPrice: Number(db.certification_price),
  followUpPrice: Number(db.follow_up_price),
  recertificationPrice: Number(db.recertification_price),
});

const mapDbToAdvisor = (db: DbAdvisor): Advisor => ({
  id: db.id,
  name: db.name,
  email: db.email || '',
  phone: db.phone || '',
  username: db.username || undefined,
});

const mapDbToBankAccount = (db: DbBankAccount): BankAccount => ({
  id: db.id,
  bankName: db.bank_name,
  accountHolder: db.account_holder,
  accountNumber: db.account_number,
  cci: db.cci || '',
  currency: db.currency as 'soles' | 'dolares',
  logo: db.logo_url || undefined,
});

const mapDbToCertificationStep = (db: DbCertificationStep): CertificationStep => ({
  id: db.id,
  order: db.step_order,
  title: db.title,
});

// ISO Standards Hook
export const useISOStandards = () => {
  const [isoStandards, setIsoStandards] = useState<ISOStandard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchISOStandards = async () => {
    const { data, error } = await supabase
      .from('iso_standards')
      .select('*')
      .order('code');
    
    if (error) {
      console.error('Error fetching ISO standards:', error);
      return;
    }
    
    setIsoStandards((data as DbISOStandard[]).map(mapDbToISOStandard));
    setLoading(false);
  };

  const addISOStandard = async (iso: Omit<ISOStandard, 'id'>) => {
    const { data, error } = await supabase
      .from('iso_standards')
      .insert({
        code: iso.code,
        name: iso.name,
        description: iso.description,
        certification_price: iso.certificationPrice,
        follow_up_price: iso.followUpPrice,
        recertification_price: iso.recertificationPrice,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding ISO standard:', error);
      throw error;
    }
    
    setIsoStandards(prev => [...prev, mapDbToISOStandard(data as DbISOStandard)]);
    return mapDbToISOStandard(data as DbISOStandard);
  };

  const updateISOStandard = async (iso: ISOStandard) => {
    const { error } = await supabase
      .from('iso_standards')
      .update({
        code: iso.code,
        name: iso.name,
        description: iso.description,
        certification_price: iso.certificationPrice,
        follow_up_price: iso.followUpPrice,
        recertification_price: iso.recertificationPrice,
      })
      .eq('id', iso.id);
    
    if (error) {
      console.error('Error updating ISO standard:', error);
      throw error;
    }
    
    setIsoStandards(prev => prev.map(item => item.id === iso.id ? iso : item));
  };

  const deleteISOStandard = async (id: string) => {
    const { error } = await supabase
      .from('iso_standards')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting ISO standard:', error);
      throw error;
    }
    
    setIsoStandards(prev => prev.filter(item => item.id !== id));
  };

  useEffect(() => {
    fetchISOStandards();
  }, []);

  return { isoStandards, setIsoStandards, loading, addISOStandard, updateISOStandard, deleteISOStandard, refetch: fetchISOStandards };
};

// Advisors Hook
export const useAdvisors = () => {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdvisors = async () => {
    const { data, error } = await supabase
      .from('advisors')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching advisors:', error);
      return;
    }
    
    setAdvisors((data as DbAdvisor[]).map(mapDbToAdvisor));
    setLoading(false);
  };

  const addAdvisor = async (advisor: Omit<Advisor, 'id'>) => {
    const { data, error } = await supabase
      .from('advisors')
      .insert({
        name: advisor.name,
        email: advisor.email,
        phone: advisor.phone,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding advisor:', error);
      throw error;
    }
    
    setAdvisors(prev => [...prev, mapDbToAdvisor(data as DbAdvisor)]);
    return mapDbToAdvisor(data as DbAdvisor);
  };

  const updateAdvisor = async (advisor: Advisor) => {
    const { error } = await supabase
      .from('advisors')
      .update({
        name: advisor.name,
        email: advisor.email,
        phone: advisor.phone,
      })
      .eq('id', advisor.id);
    
    if (error) {
      console.error('Error updating advisor:', error);
      throw error;
    }
    
    setAdvisors(prev => prev.map(item => item.id === advisor.id ? advisor : item));
  };

  const deleteAdvisor = async (id: string) => {
    const { error } = await supabase
      .from('advisors')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting advisor:', error);
      throw error;
    }
    
    setAdvisors(prev => prev.filter(item => item.id !== id));
  };

  useEffect(() => {
    fetchAdvisors();
  }, []);

  return { advisors, setAdvisors, loading, addAdvisor, updateAdvisor, deleteAdvisor, refetch: fetchAdvisors };
};

// Bank Accounts Hook
export const useBankAccounts = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBankAccounts = async () => {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .order('bank_name');
    
    if (error) {
      console.error('Error fetching bank accounts:', error);
      return;
    }
    
    setBankAccounts((data as DbBankAccount[]).map(mapDbToBankAccount));
    setLoading(false);
  };

  const addBankAccount = async (bank: Omit<BankAccount, 'id'>) => {
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert({
        bank_name: bank.bankName,
        account_holder: bank.accountHolder,
        account_number: bank.accountNumber,
        cci: bank.cci,
        currency: bank.currency,
        logo_url: bank.logo,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding bank account:', error);
      throw error;
    }
    
    setBankAccounts(prev => [...prev, mapDbToBankAccount(data as DbBankAccount)]);
    return mapDbToBankAccount(data as DbBankAccount);
  };

  const updateBankAccount = async (bank: BankAccount) => {
    const { error } = await supabase
      .from('bank_accounts')
      .update({
        bank_name: bank.bankName,
        account_holder: bank.accountHolder,
        account_number: bank.accountNumber,
        cci: bank.cci,
        currency: bank.currency,
        logo_url: bank.logo,
      })
      .eq('id', bank.id);
    
    if (error) {
      console.error('Error updating bank account:', error);
      throw error;
    }
    
    setBankAccounts(prev => prev.map(item => item.id === bank.id ? bank : item));
  };

  const deleteBankAccount = async (id: string) => {
    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting bank account:', error);
      throw error;
    }
    
    setBankAccounts(prev => prev.filter(item => item.id !== id));
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  return { bankAccounts, setBankAccounts, loading, addBankAccount, updateBankAccount, deleteBankAccount, refetch: fetchBankAccounts };
};

// Certification Steps Hook
export const useCertificationSteps = () => {
  const [certificationSteps, setCertificationSteps] = useState<CertificationStep[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCertificationSteps = async () => {
    const { data, error } = await supabase
      .from('certification_steps')
      .select('*')
      .order('step_order');
    
    if (error) {
      console.error('Error fetching certification steps:', error);
      return;
    }
    
    setCertificationSteps((data as DbCertificationStep[]).map(mapDbToCertificationStep));
    setLoading(false);
  };

  const addCertificationStep = async (step: Omit<CertificationStep, 'id'>) => {
    const { data, error } = await supabase
      .from('certification_steps')
      .insert({
        step_order: step.order,
        title: step.title,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding certification step:', error);
      throw error;
    }
    
    setCertificationSteps(prev => [...prev, mapDbToCertificationStep(data as DbCertificationStep)]);
    return mapDbToCertificationStep(data as DbCertificationStep);
  };

  const updateCertificationStep = async (step: CertificationStep) => {
    const { error } = await supabase
      .from('certification_steps')
      .update({
        step_order: step.order,
        title: step.title,
      })
      .eq('id', step.id);
    
    if (error) {
      console.error('Error updating certification step:', error);
      throw error;
    }
    
    setCertificationSteps(prev => prev.map(item => item.id === step.id ? step : item));
  };

  const deleteCertificationStep = async (id: string) => {
    const { error } = await supabase
      .from('certification_steps')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting certification step:', error);
      throw error;
    }
    
    setCertificationSteps(prev => {
      const filtered = prev.filter(item => item.id !== id);
      return filtered.map((step, index) => ({ ...step, order: index + 1 }));
    });
  };

  const reorderCertificationSteps = async (steps: CertificationStep[]) => {
    // Update all steps with new order
    for (const step of steps) {
      await supabase
        .from('certification_steps')
        .update({ step_order: step.order })
        .eq('id', step.id);
    }
    setCertificationSteps(steps);
  };

  useEffect(() => {
    fetchCertificationSteps();
  }, []);

  return { 
    certificationSteps, 
    setCertificationSteps, 
    loading, 
    addCertificationStep, 
    updateCertificationStep, 
    deleteCertificationStep, 
    reorderCertificationSteps,
    refetch: fetchCertificationSteps 
  };
};

// Quotations Hook
export const useQuotations = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotations = async () => {
    const { data: quotationsData, error: quotationsError } = await supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (quotationsError) {
      console.error('Error fetching quotations:', quotationsError);
      return;
    }

    // Fetch ISOs for each quotation
    const quotationsWithISOs: Quotation[] = [];
    
    for (const q of quotationsData as DbQuotation[]) {
      const { data: isosData } = await supabase
        .from('quotation_isos')
        .select('*')
        .eq('quotation_id', q.id);
      
      const selectedISOs: SelectedISO[] = ((isosData || []) as DbQuotationISO[]).map(iso => ({
        isoId: iso.iso_id,
        certification: iso.certification,
        certificationPrice: Number(iso.certification_price),
        followUp: iso.follow_up,
        followUpPrice: Number(iso.follow_up_price),
        recertification: iso.recertification,
        recertificationPrice: Number(iso.recertification_price),
      }));

      quotationsWithISOs.push({
        id: q.id,
        code: q.code,
        date: q.date,
        client: {
          ruc: q.client_ruc || '',
          razonSocial: q.client_razon_social || '',
          representante: q.client_representante || '',
          celular: q.client_celular || '',
          correo: q.client_correo || '',
          asesorId: q.advisor_id || '',
          fecha: new Date(q.date),
          codigo: q.code,
        },
        selectedISOs,
        subtotal: Number(q.subtotal),
        igv: Number(q.igv),
        discount: Number(q.discount),
        total: Number(q.total),
        status: q.status as 'draft' | 'sent' | 'approved' | 'rejected',
        includeIGV: q.include_igv,
        implementation: {
          enabled: q.implementation_enabled,
          companySize: (q.implementation_company_size || 'pequeña') as 'pequeña' | 'mediana' | 'grande',
          unitPrice: Number(q.implementation_unit_price),
          quantity: q.implementation_quantity,
        },
        implementationTotal: Number(q.implementation_total),
      });
    }
    
    setQuotations(quotationsWithISOs);
    setLoading(false);
  };

  const addQuotation = async (quotation: Omit<Quotation, 'id'>) => {
    // Insert quotation
    const { data: quotationData, error: quotationError } = await supabase
      .from('quotations')
      .insert({
        code: quotation.code,
        date: quotation.date,
        client_ruc: quotation.client.ruc,
        client_razon_social: quotation.client.razonSocial,
        client_representante: quotation.client.representante,
        client_celular: quotation.client.celular,
        client_correo: quotation.client.correo,
        advisor_id: quotation.client.asesorId || null,
        subtotal: quotation.subtotal,
        igv: quotation.igv,
        discount: quotation.discount,
        total: quotation.total,
        status: quotation.status,
        include_igv: quotation.includeIGV ?? true,
        implementation_enabled: quotation.implementation?.enabled ?? false,
        implementation_company_size: quotation.implementation?.companySize ?? 'pequeña',
        implementation_unit_price: quotation.implementation?.unitPrice ?? 0,
        implementation_quantity: quotation.implementation?.quantity ?? 1,
        implementation_total: quotation.implementationTotal ?? 0,
      })
      .select()
      .single();
    
    if (quotationError) {
      console.error('Error adding quotation:', quotationError);
      throw quotationError;
    }

    // Insert quotation ISOs
    if (quotation.selectedISOs.length > 0) {
      const isosToInsert = quotation.selectedISOs.map(iso => ({
        quotation_id: (quotationData as DbQuotation).id,
        iso_id: iso.isoId,
        certification: iso.certification,
        certification_price: iso.certificationPrice,
        follow_up: iso.followUp,
        follow_up_price: iso.followUpPrice,
        recertification: iso.recertification,
        recertification_price: iso.recertificationPrice,
      }));

      const { error: isosError } = await supabase
        .from('quotation_isos')
        .insert(isosToInsert);
      
      if (isosError) {
        console.error('Error adding quotation ISOs:', isosError);
      }
    }

    const newQuotation: Quotation = {
      ...quotation,
      id: (quotationData as DbQuotation).id,
    };
    
    setQuotations(prev => [newQuotation, ...prev]);
    return newQuotation;
  };

  const updateQuotation = async (quotation: Quotation) => {
    // Update quotation
    const { error: quotationError } = await supabase
      .from('quotations')
      .update({
        code: quotation.code,
        date: quotation.date,
        client_ruc: quotation.client.ruc,
        client_razon_social: quotation.client.razonSocial,
        client_representante: quotation.client.representante,
        client_celular: quotation.client.celular,
        client_correo: quotation.client.correo,
        advisor_id: quotation.client.asesorId || null,
        subtotal: quotation.subtotal,
        igv: quotation.igv,
        discount: quotation.discount,
        total: quotation.total,
        status: quotation.status,
        include_igv: quotation.includeIGV ?? true,
        implementation_enabled: quotation.implementation?.enabled ?? false,
        implementation_company_size: quotation.implementation?.companySize ?? 'pequeña',
        implementation_unit_price: quotation.implementation?.unitPrice ?? 0,
        implementation_quantity: quotation.implementation?.quantity ?? 1,
        implementation_total: quotation.implementationTotal ?? 0,
      })
      .eq('id', quotation.id);
    
    if (quotationError) {
      console.error('Error updating quotation:', quotationError);
      throw quotationError;
    }

    // Delete existing ISOs and re-insert
    await supabase
      .from('quotation_isos')
      .delete()
      .eq('quotation_id', quotation.id);

    // Insert updated quotation ISOs
    if (quotation.selectedISOs.length > 0) {
      const isosToInsert = quotation.selectedISOs.map(iso => ({
        quotation_id: quotation.id,
        iso_id: iso.isoId,
        certification: iso.certification,
        certification_price: iso.certificationPrice,
        follow_up: iso.followUp,
        follow_up_price: iso.followUpPrice,
        recertification: iso.recertification,
        recertification_price: iso.recertificationPrice,
      }));

      const { error: isosError } = await supabase
        .from('quotation_isos')
        .insert(isosToInsert);
      
      if (isosError) {
        console.error('Error updating quotation ISOs:', isosError);
      }
    }
    
    setQuotations(prev => prev.map(q => q.id === quotation.id ? quotation : q));
  };

  const deleteQuotation = async (id: string) => {
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting quotation:', error);
      throw error;
    }
    
    setQuotations(prev => prev.filter(q => q.id !== id));
  };

  const getNextQuotationCode = async (fecha: Date): Promise<string> => {
    const year = fecha.getFullYear();
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `COT-${year}-${month}-`;
    
    const { data } = await supabase
      .from('quotations')
      .select('code')
      .like('code', `${prefix}%`);
    
    const existingCodes = (data || [])
      .map(q => parseInt(q.code.split('-').pop() || '0', 10));
    const nextNumber = existingCodes.length > 0 ? Math.max(...existingCodes) + 1 : 1;
    
    return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  return { quotations, setQuotations, loading, addQuotation, updateQuotation, deleteQuotation, getNextQuotationCode, refetch: fetchQuotations };
};

// Attached Files Hook
export const useAttachedFiles = () => {
  const [attachedFile, setAttachedFile] = useState<{ url: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveFile = async () => {
    const { data, error } = await supabase
      .from('attached_files')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching attached file:', error);
      setLoading(false);
      return;
    }
    
    if (data) {
      const file = data as DbAttachedFile;
      // Get public URL from storage
      const { data: urlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(file.file_path);
      
      setAttachedFile({
        url: urlData.publicUrl,
        name: file.file_name,
      });
    }
    
    setLoading(false);
  };

  const uploadFile = async (file: File): Promise<{ url: string; name: string }> => {
    const fileName = `${Date.now()}-${file.name}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(fileName, file);
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }

    // Deactivate all previous files
    await supabase
      .from('attached_files')
      .update({ is_active: false })
      .eq('is_active', true);

    // Insert metadata
    const { error: insertError } = await supabase
      .from('attached_files')
      .insert({
        file_name: file.name,
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type,
        is_active: true,
      });
    
    if (insertError) {
      console.error('Error inserting file metadata:', insertError);
      throw insertError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(fileName);

    const newFile = {
      url: urlData.publicUrl,
      name: file.name,
    };
    
    setAttachedFile(newFile);
    return newFile;
  };

  const removeFile = async () => {
    const { data } = await supabase
      .from('attached_files')
      .select('file_path')
      .eq('is_active', true)
      .maybeSingle();
    
    if (data) {
      // Delete from storage
      await supabase.storage
        .from('attachments')
        .remove([(data as { file_path: string }).file_path]);
    }

    // Deactivate in database
    await supabase
      .from('attached_files')
      .update({ is_active: false })
      .eq('is_active', true);
    
    setAttachedFile(null);
  };

  useEffect(() => {
    fetchActiveFile();
  }, []);

  return { attachedFile, loading, uploadFile, removeFile, refetch: fetchActiveFile };
};
