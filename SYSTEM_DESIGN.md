# System Design QA

## C1: High-Concurrency Design

### Architechtural Diagram:

```text
                    ┌───────────────────────┐
                    │ CDN / Load Balancer   │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
        ┌─────▼─────┐     ┌────▼─────┐     ┌────▼─────┐
        │ API #1    │     │ API #2   │ ... │ API #N   │
        └─────┬─────┘     └────┬─────┘     └────┬─────┘
              │                 │                 │
              └─────────────────┼─────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │ Redis Cluster         │
                    │ reservations / rate   │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │ PostgreSQL Primary     │
                    │ durable inventory      │
                    │ orders / users / carts │
                    └───────────┬───────────┘
                                │
                       ┌────────▼────────┐
                       │ Read replicas   │
                       └─────────────────┘
```

Techniques:

- Stateless Node.js API instances.
- Load balancing across instances.
- Redis for the hot reservation path.
- Connection pooling.
- Proper database indexes.
- Product reads cached aggressively.
- Queue expensive downstream work.
- Rate limit per IP/user/product.
- Keep checkout transactions short.
- Avoid locking the whole product table.
- Partition or shard exceptionally hot products if needed.

10,000 HTTP requests/sec does not mean 10,000 PostgreSQL transactions/sec. The architecture should absorb the hot read/reservation traffic at Redis and only send necessary durable work to PostgreSQL.

## C2: Data Consistency

### Eventual consistency:

The UI stock number may be slightly stale because it can come from a cache/read replica. It must never be used as the authority for checkout.

The authoritative decision is made by the atomic PostgreSQL stock update.

For a stronger UX, publish stock changes asynchronously and invalidate product cache after successful order commits.

### Redis Recovery:

A production system should periodically rebuild product reservation counters from PostgreSQL durable state or an inventory ledger.

A stronger design stores an inventory ledger:

- INVENTORY_RECEIVED
- INVENTORY_RESERVED
- INVENTORY_RELEASED
- INVENTORY_SOLD

Then Redis can be reconstructed from durable events/state after failure.

## D1 Overselling:

Likely causes:

- Read stock, then write stock separately.
- Two transactions both read 1 and both write 0.
- No database constraint/atomic decrement.
- Stock cached in application memory.
- Redis reservation and database stock are updated independently without reconciliation.
- Retries create duplicate orders.

Recommended fix:

```sql
UPDATE products
SET stock = stock - :qty
WHERE id = :id
  AND stock >= :qty;
```

We need to check `affectedRows === 1`.

For multi-item checkout, perform the guarded updates inside one database transaction. Roll back every product update if any item cannot be fulfilled.

## D2 Duplicate checkout:

The client generates an idempotency key once per checkout attempt and reuses it on retries.

Database:

```sql
CREATE UNIQUE INDEX uq_orders_idempotency
ON orders(idempotency_key);
```

If the browser refreshes and sends the same key:

```text
request 1 ──┐
request 2 ──┼── unique DB constraint ── one order
request 3 ──┘
```

The second request returns the already-created order instead of creating another order.

A payment provider should have its own idempotency key as well.
