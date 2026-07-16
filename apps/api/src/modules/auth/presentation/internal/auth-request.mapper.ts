import type { Request } from 'express';

import type { RequestMetaDTO } from '../../application/auth.dto';

export const toAuthRequestMeta = (req: Request): RequestMetaDTO => ({
  device: req.headers['sec-ch-ua-platform']?.toString(),
  userAgent: req.headers['user-agent'],
  ipAddress: req.ip,
});
