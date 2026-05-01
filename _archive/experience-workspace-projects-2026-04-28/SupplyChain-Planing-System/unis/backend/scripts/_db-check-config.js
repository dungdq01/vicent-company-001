const { Client } = require('pg');
(async () => {
  const c = new Client({
    host: 'localhost', port: 5432,
    database: 'unis_scp_flow1_test_20260421_01',
    user: 'postgres', password: 'postgres',
  });
  await c.connect();

  const cfg = await c.query(
    `SELECT config_group, config_key, config_value FROM system_config ORDER BY config_group, config_key`
  );
  console.log(`system_config rows: ${cfg.rows.length}`);
  console.table(cfg.rows);

  const flags = await c.query(
    `SELECT flag_name, enabled FROM feature_flag ORDER BY flag_name`
  );
  console.log(`\nfeature_flag rows: ${flags.rows.length}`);
  console.table(flags.rows);

  const rc = await c.query(
    `SELECT code, label_vi, is_active FROM reason_code ORDER BY code`
  );
  console.log(`\nreason_code rows: ${rc.rows.length}`);
  console.table(rc.rows);

  await c.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
