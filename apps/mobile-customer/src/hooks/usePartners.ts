import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:3000';

export interface Partner {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  description?: string;
  coverImageUrl?: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  location?: { lat: number; lng: number };
  deliveryFee: number;
  minimumOrder: number;
  sla_minutes: number;
  rating: number;
  total_orders: number;
}

export function usePartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPartners = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/partners?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setPartners(data.partners || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load partners');
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    searchPartners('');
  }, [searchPartners]);

  return { partners, loading, error, searchPartners };
}

export function usePartnerDetails(partnerId: string) {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [partnerRes, menuRes] = await Promise.all([
          fetch(`${API_URL}/api/partners/${partnerId}`),
          fetch(`${API_URL}/api/partners/${partnerId}/menu`),
        ]);
        setPartner(await partnerRes.json());
        setMenu(await menuRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [partnerId]);

  return { partner, menu, loading };
}