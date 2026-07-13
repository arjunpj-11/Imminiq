import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import api from '../../../lib/axios';

interface IRegisterPayload {
  fullName: string;
  identifier: string; // email or phone number
  password: string;
}

interface IRegisterResponse {
  success: boolean;
  message: string;
  data?: {
    userId?: string;
    email?: string;
    phone?: string;
    verificationTarget?: string;
    verificationMethod?: 'email' | 'phone';
  };
}

interface IApiErrorResponse {
  success?: boolean;
  message?: string;
}

const registerUser = async (data: IRegisterPayload): Promise<IRegisterResponse> => {
  const response = await api.post<IRegisterResponse>('/auth/register', data);
  return response.data;
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation<IRegisterResponse, AxiosError<IApiErrorResponse>, IRegisterPayload>({
    mutationFn: registerUser,

    onSuccess: (data, variables) => {
      navigate('/verify-account', {
        replace: true,
        state: {
          identifier: data.data?.verificationTarget || variables.identifier,
          method: data.data?.verificationMethod,
          purpose: 'account_verification',
          from: 'register',
        },
      });
    },

    onError: (error) => {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';

      console.error(message);
    },
  });
};
