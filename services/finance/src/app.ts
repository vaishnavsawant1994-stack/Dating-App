import Fastify, { type FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { FINANCE_CONTRACT_VERSION, postLedgerTransactionSchema } from './contracts.js';
import { LedgerValidationError, validateLedgerTransaction } from './ledger.js';
import { FinanceIdempotencyConflictError } from './store.js';
import { type FinanceAccessAuthorizer, type FinanceConfig, type FinanceLedgerStore } from './types.js';

interface FinanceAppDependencies {
  readonly authorizer: FinanceAccessAuthorizer;
  readonly store: FinanceLedgerStore;
  readonly createId?: () => string;
  readonly now?: () => Date;
}

const idempotencyPattern = /^[A-Za-z0-9:_-]{8,128}$/;

export async function buildFinanceApp(config: FinanceConfig, dependencies: FinanceAppDependencies): Promise<FastifyInstance> {
  const createId = dependencies.createId ?? randomUUID;
  const now = dependencies.now ?? (() => new Date());
  const app = Fastify({
    bodyLimit: config.bodyLimitBytes,
    logger: config.logging
      ? {
          level: config.logLevel,
          base: { service: config.serviceName, environment: config.environment },
          redact: {
            paths: ['req.headers.authorization', 'req.headers.cookie', 'req.headers.idempotency-key', 'req.body'],
            censor: '[REDACTED]',
          },
        }
      : false,
  });

  app.get('/health/live', async () => ({ status: 'ok', service: config.serviceName }));
  app.get('/health/ready', async (_request, reply) => {
    if (!dependencies.authorizer.isReady()) {
      return reply.code(503).send({ status: 'not_ready', dependency: 'authorization' });
    }
    if (!(await dependencies.store.isReady())) {
      return reply.code(503).send({ status: 'not_ready', dependency: 'ledger_store' });
    }
    return { status: 'ready', service: config.serviceName, store: dependencies.store.name };
  });

  app.post('/v1/finance/ledger-transactions', async (request, reply) => {
    const requestId = createId();
    const idempotencyHeader = request.headers['idempotency-key'];
    if (typeof idempotencyHeader !== 'string' || !idempotencyPattern.test(idempotencyHeader)) {
      return reply.code(400).send({
        error: { code: 'IDEMPOTENCY_KEY_REQUIRED', message: 'A valid Idempotency-Key header is required.', request_id: requestId },
      });
    }

    const parsed = postLedgerTransactionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: { code: 'INVALID_LEDGER_TRANSACTION', message: 'Ledger transaction does not match the service contract.', request_id: requestId },
      });
    }

    const principal = await dependencies.authorizer.authorize({
      requestId,
      remoteAddress: request.ip,
      action: 'post_ledger_transaction',
      book: parsed.data.book,
    });
    if (principal === null) {
      return reply.code(403).send({
        error: { code: 'FINANCE_ACCESS_DENIED', message: 'Finance ledger access is not authorized.', request_id: requestId },
      });
    }

    try {
      validateLedgerTransaction(parsed.data);
    } catch (error) {
      if (error instanceof LedgerValidationError) {
        return reply.code(400).send({
          error: { code: 'LEDGER_INVARIANT_VIOLATION', message: error.message, request_id: requestId },
        });
      }
      throw error;
    }

    if (!(await dependencies.store.isReady())) {
      return reply.code(503).send({
        error: { code: 'FINANCE_STORE_UNAVAILABLE', message: 'Finance ledger storage is unavailable.', request_id: requestId },
      });
    }

    try {
      const transaction = await dependencies.store.post({
        transactionId: createId(),
        idempotencyKey: idempotencyHeader,
        book: parsed.data.book,
        unit: parsed.data.unit,
        economicEventType: parsed.data.economic_event_type,
        economicEventId: parsed.data.economic_event_id,
        entries: parsed.data.entries.map((entry) => ({ accountId: entry.account_id, amountMinor: entry.amount_minor })),
        createdAt: now().toISOString(),
        actorId: principal.actorId,
        actorType: principal.actorType,
      });
      return reply.code(201).send({
        v: FINANCE_CONTRACT_VERSION,
        request_id: requestId,
        transaction_id: transaction.transactionId,
        book: transaction.book,
        unit: transaction.unit,
        status: transaction.status,
        created_at: transaction.createdAt,
      });
    } catch (error) {
      if (error instanceof FinanceIdempotencyConflictError) {
        return reply.code(409).send({
          error: { code: 'IDEMPOTENCY_CONFLICT', message: error.message, request_id: requestId },
        });
      }
      throw error;
    }
  });

  return app;
}
