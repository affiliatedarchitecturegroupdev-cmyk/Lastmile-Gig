'use client';

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export function useAddresses() {
  const addresses: Address[] = [
    {
      id: '1',
      label: 'Home',
      street: '123 Main St',
      city: 'Johannesburg',
      province: 'Gauteng',
      postalCode: '2001',
      lat: -26.2041,
      lng: 28.0473,
      isDefault: true,
    },
  ];

  const addAddress = (address: Omit<Address, 'id'>) => {
    const newAddress = { ...address, id: crypto.randomUUID() };
    addresses.push(newAddress);
    return newAddress;
  };

  const updateAddress = (id: string, data: Partial<Address>) => {
    const idx = addresses.findIndex(a => a.id === id);
    if (idx >= 0) Object.assign(addresses[idx], data);
  };

  const deleteAddress = (id: string) => {
    const idx = addresses.findIndex(a => a.id === id);
    if (idx >= 0) addresses.splice(idx, 1);
  };

  const setDefault = (id: string) => {
    addresses.forEach(a => (a.isDefault = a.id === id));
  };

  const getDefault = () => addresses.find(a => a.isDefault);

  return { addresses, addAddress, updateAddress, deleteAddress, setDefault, getDefault };
}