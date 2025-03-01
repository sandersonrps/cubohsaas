import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Customer {
  id: string;
  nome_razao_social: string;
  email: string;
  telefone: string;
  celular: string;
  tipo_pessoa: string;
  cpf_cnpj: string;
  status: boolean;
  created_at: string;
  client_number: string;
}

interface CustomerMetrics {
  total: number;
  active: number;
  newThisMonth: number;
  retentionRate: number;
}

interface UseCustomersReturn {
  customers: Customer[];
  metrics: CustomerMetrics;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

const CACHE_KEY = 'customers-cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheData {
  customers: Customer[];
  metrics: CustomerMetrics;
  timestamp: number;
}

export function useCustomers(): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [metrics, setMetrics] = useState<CustomerMetrics>({
    total: 0,
    active: 0,
    newThisMonth: 0,
    retentionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const getCachedData = (): CacheData | null => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsedCache = JSON.parse(cached);
    const now = Date.now();

    if (now - parsedCache.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsedCache;
  };

  const setCacheData = (data: CacheData) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      ...data,
      timestamp: Date.now()
    }));
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'todos') {
        query = query.eq('status', statusFilter === 'ativo');
      }

      if (searchTerm) {
        query = query.or(
          `nome_razao_social.ilike.%${searchTerm}%,cpf_cnpj.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
        );
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setCustomers(data || []);

      // Fetch metrics
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [totalCount, activeCount, newCount] = await Promise.all([
        supabase.from('clientes').select('count', { count: 'exact' }),
        supabase.from('clientes').select('count', { count: 'exact' }).eq('status', true),
        supabase.from('clientes').select('count', { count: 'exact' }).gte('created_at', firstDayOfMonth)
      ]);

      const newMetrics = {
        total: totalCount.count || 0,
        active: activeCount.count || 0,
        newThisMonth: newCount.count || 0,
        retentionRate: totalCount.count ? 
          Math.round((activeCount.count || 0) / totalCount.count * 100) : 0
      };

      setMetrics(newMetrics);

      // Update cache
      setCacheData({
        customers: data || [],
        metrics: newMetrics,
        timestamp: Date.now()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching customers');
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Check for associated sales
      const { data: salesData, error: salesError } = await supabase
        .from('vendas')
        .select('numero_venda')
        .eq('cliente_id', id);

      if (salesError) throw salesError;

      if (salesData && salesData.length > 0) {
        const saleNumbers = salesData.map(sale => sale.numero_venda).join(', ');
        return {
          success: false,
          error: `Não é possível excluir o cliente pois existem vendas associadas. Por favor, exclua primeiro as vendas: ${saleNumbers}.`
        };
      }

      const { error: deleteError } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Update local state
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        total: prev.total - 1,
        active: prev.active - (customers.find(c => c.id === id)?.status ? 1 : 0)
      }));

      // Clear cache to force refresh on next load
      localStorage.removeItem(CACHE_KEY);

      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the customer');
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred while deleting the customer' };
    } finally {
      setLoading(false);
    }
  };

  return {
    customers,
    metrics,
    loading,
    error,
    refetch: fetchCustomers,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    deleteCustomer
  };
}