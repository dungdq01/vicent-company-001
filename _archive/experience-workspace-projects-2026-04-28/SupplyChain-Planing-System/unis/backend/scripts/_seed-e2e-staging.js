'use strict';
// ============================================================
// E2E staging seed for M23 DRP Netting v2 test.
// Idempotent. DRY_RUN by default; set CONFIRM_IMPORT=YES + DRY_RUN=false to execute.
//
// Steps (all within a single tx):
//   1. Shift demand_snapshot_line.period_start by +20 weeks (once)
//   2. Seed sku_cn_mapping for every (cn,sku) in shifted demand scope
//   3. Seed one FROZEN supply_snapshot (+ lines) with synthetic on_hand
//      = CEIL(avg weekly demand * 4) per (cn,sku); in_transit = 0
//      For every ACTIVE supplier, insert one supply_snapshot row so
//      freshness gate passes (capture_at=NOW, is_legacy_data=false).
// ============================================================

const { makeClient, EXECUTE, DRY_RUN, log } = require('./import-real/_lib');

const SHIFT_WEEKS = 20;
const ON_HAND_WEEKS_COVER = 4;

(async () => {
  const client = makeClient();
  await client.connect();
  log(`MODE = ${EXECUTE ? 'EXECUTE' : 'DRY_RUN'}`);

  try {
    await client.query('BEGIN');

    // ─── 1. Shift demand dates (idempotent via marker table) ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS e2e_staging_marker (
        key VARCHAR PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    const marker = await client.query(
      `SELECT value FROM e2e_staging_marker WHERE key = 'demand_shift_weeks'`,
    );
    if (marker.rowCount === 0) {
      const r = await client.query(
        `UPDATE demand_snapshot_line
         SET period_start = period_start + ($1 || ' weeks')::interval
         WHERE snapshot_id IN (SELECT snapshot_id FROM demand_snapshot WHERE status='FROZEN')`,
        [SHIFT_WEEKS],
      );
      await client.query(
        `INSERT INTO e2e_staging_marker (key, value) VALUES ('demand_shift_weeks', $1)`,
        [String(SHIFT_WEEKS)],
      );
      log(`[1] demand shifted +${SHIFT_WEEKS}w (${r.rowCount} lines)`);
    } else {
      log(`[1] demand already shifted (+${marker.rows[0].value}w) — skip`);
    }

    // ─── 2. Seed sku_cn_mapping for every (cn,sku) in shifted demand scope ──
    const scmBefore = await client.query(`SELECT COUNT(*) FROM sku_cn_mapping`);
    await client.query(`
      INSERT INTO sku_cn_mapping (sku_id, cn_id, active)
      SELECT DISTINCT s.id, c.id, TRUE
      FROM demand_snapshot_line dsl
      JOIN demand_snapshot ds ON ds.snapshot_id = dsl.snapshot_id AND ds.status='FROZEN'
      JOIN sku s     ON s.sku_code = dsl.item_code OR s.id::text = dsl.item_code
      JOIN channel c ON c.cn_code   = dsl.location_code
      WHERE dsl.period_start >= CURRENT_DATE
        AND dsl.period_start <  CURRENT_DATE + INTERVAL '12 weeks'
      ON CONFLICT (sku_id, cn_id) DO UPDATE SET active = TRUE
    `);
    const scmAfter = await client.query(`SELECT COUNT(*) FROM sku_cn_mapping WHERE active=TRUE`);
    log(`[2] sku_cn_mapping: before=${scmBefore.rows[0].count}, active_after=${scmAfter.rows[0].count}`);

    // ─── 3. Seed supply_snapshot (+ lines) ────────────────────
    // 3a. One supply_snapshot per ACTIVE supplier (freshness gate requirement)
    const snapIns = await client.query(`
      INSERT INTO supply_snapshot (snapshot_name, nm_code, status, source, capture_at, synced_at, is_legacy_data, frozen_at, frozen_by, created_by)
      SELECT 'E2E_STAGING_' || s.supplier_code, s.supplier_code, 'FROZEN', 'BRAVO', NOW(), NOW(), FALSE, NOW(), 'E2E_SEED', 'E2E_SEED'
      FROM supplier s
      WHERE s.status='ACTIVE'
        AND NOT EXISTS (
          SELECT 1 FROM supply_snapshot ss
          WHERE ss.nm_code = s.supplier_code AND ss.status='FROZEN'
            AND ss.capture_at > NOW() - INTERVAL '1 hour'
        )
      RETURNING id, nm_code
    `);
    log(`[3a] supply_snapshot rows inserted: ${snapIns.rowCount}`);

    // 3b. Pick ONE canonical snapshot (latest) to hang lines on.
    // M23 picks `ORDER BY capture_at DESC NULLS LAST, id DESC LIMIT 1`.
    const canonSnap = await client.query(`
      SELECT id FROM supply_snapshot
      WHERE status='FROZEN'
      ORDER BY capture_at DESC NULLS LAST, id DESC LIMIT 1
    `);
    const canonId = canonSnap.rows[0].id;
    log(`[3b] canonical snapshot id = ${canonId}`);

    // 3c. Generate supply_snapshot_line with on_hand = ceil(avg weekly demand * 4)
    // Only if lines don't already exist for this snapshot.
    const existingLines = await client.query(
      `SELECT COUNT(*) FROM supply_snapshot_line WHERE snapshot_id = $1`, [canonId],
    );
    if (Number(existingLines.rows[0].count) === 0) {
      // M23 uses COALESCE(override_qty, allocatable_qty) as on_hand.
      const linesIns = await client.query(`
        INSERT INTO supply_snapshot_line
          (snapshot_id, item_code, location_code, allocatable_qty, reserved_qty, quarantine_qty, in_transit_qty, freshness)
        SELECT
          $1,
          s.sku_code,
          c.cn_code,
          CEIL(AVG(dsl.qty) * $2)::numeric,
          0, 0, 0, 'PASS'
        FROM demand_snapshot_line dsl
        JOIN demand_snapshot ds ON ds.snapshot_id = dsl.snapshot_id AND ds.status='FROZEN'
        JOIN sku s     ON s.sku_code = dsl.item_code OR s.id::text = dsl.item_code
        JOIN channel c ON c.cn_code   = dsl.location_code
        WHERE dsl.period_start >= CURRENT_DATE
          AND dsl.period_start <  CURRENT_DATE + INTERVAL '12 weeks'
        GROUP BY s.sku_code, c.cn_code
      `, [canonId, ON_HAND_WEEKS_COVER]);
      log(`[3c] supply_snapshot_line inserted: ${linesIns.rowCount}`);
    } else {
      log(`[3c] supply_snapshot_line already exists (${existingLines.rows[0].count}) — skip`);
    }

    if (EXECUTE) {
      await client.query('COMMIT');
      log('COMMITTED ✓');
    } else {
      await client.query('ROLLBACK');
      log('ROLLBACK (DRY_RUN — re-run with DRY_RUN=false CONFIRM_IMPORT=YES)');
    }
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[FAIL]', e);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
