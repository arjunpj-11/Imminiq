import { useMutation } from '@tanstack/react-query';

import { downloadServerCsv } from '../../lib/admin/downloadServerCsv';

interface IDownloadAdminCsvInput {
  endpoint: string;
  filename: string;
  params?: Record<string, string>;
}

export const useDownloadAdminCsv = () =>
  useMutation({
    mutationFn: ({ endpoint, filename, params }: IDownloadAdminCsvInput) =>
      downloadServerCsv(endpoint, filename, params),
  });
