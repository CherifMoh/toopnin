import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useProduct(productId) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/products/${productId}`);
      return data;
    },
  });
}

export function useWilayas() {
  return useQuery({
    queryKey: ['wilayas'],
    queryFn: async () => {
      const { data } = await axios.get('/api/wilayas/wilayasCodes');
      return data.wilayas;
    },
  });
}

export function useFees() {
  return useQuery({
    queryKey: ['fees'],
    queryFn: async () => {
      const { data } = await axios.get('/api/wilayas/fees');
      return data.fees;
    },
  });
}

export function useCommunes() {
  return useQuery({
    queryKey: ['communes'],
    queryFn: async () => {
      const { data } = await axios.get('/api/wilayas/communes');
      return data.communes;
    },
  });
}
