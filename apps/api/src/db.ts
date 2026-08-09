import pg from 'pg';

const { Pool } = pg;

export function createPool(connectionString: string): pg.Pool {
  const pool = new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000
  });
  // node-postgres emits 'error' on the pool whenever an already-idle pooled
  // client hits a backend-side failure (e.g. the database container
  // restarts or resets the connection). An EventEmitter 'error' with no
  // listener is thrown and crashes the whole process -- silently killing
  // every in-flight request with no response ever sent to the caller.
  // Never logs the raw error: it may carry connection details.
  pool.on('error', () => {
    console.error(JSON.stringify({ event: 'pool_idle_client_error' }));
  });
  return pool;
}

/**
 * Never throws and never returns or logs the underlying error, since it may
 * carry connection details. Callers only ever see a boolean.
 */
export async function checkDatabaseConnection(pool: pg.Pool): Promise<boolean> {
  try {
    const result = await pool.query<{ ok: number }>('SELECT 1 AS ok');
    return result.rows[0]?.ok === 1;
  } catch {
    return false;
  }
}
