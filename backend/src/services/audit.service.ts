import { AuditAction } from '@prisma/client';
import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';

interface AuditInput {
  actorId?: string | null;
  actorName: string;
  action: AuditAction;
  change: string;
  ip?: string;
}

/** Fire-and-forget audit trail writer — never throws into the request path. */
export async function recordAudit(input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        actorName: input.actorName,
        action: input.action,
        change: input.change,
        ip: input.ip,
      },
    });
  } catch (err) {
    logger.warn('Failed to write audit log', err);
  }
}
