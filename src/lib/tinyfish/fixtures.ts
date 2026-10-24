export const DEMO_RUN_FIXTURE = {
  runId: 'tf-run-demo-acme-q3',
  status: 'COMPLETED',
  replayUrl: 'https://agent.tinyfish.ai/replays/rf-demo-q3-acme-78192a',
  browserMetadata: {
    viewport: { width: 1280, height: 800 },
    pagesVisited: 3,
    actionsTaken: 7,
  },
  extractedData: {
    report_title: 'Acme Inventory Q3 Regional Sales Performance',
    period: 'Q3 2026',
    items: [
      { region: 'North America', sku: 'ACM-8812', product_name: 'UltraSensor Pro', units_sold: 4120, unit_price: 25.0, revenue: 103000.0 },
      { region: 'Europe West', sku: 'ACM-9941', product_name: 'HydraValves X', units_sold: 2840, unit_price: 30.0, revenue: 85200.0 },
      { region: 'Asia Pacific', sku: 'ACM-4410', product_name: 'OptiRelay 400', units_sold: 6190, unit_price: 25.0, revenue: 154750.0 },
      { region: 'Latin America', sku: 'ACM-2298', product_name: 'MicroActuator G2', units_sold: 1340, unit_price: 25.0, revenue: 33500.0 },
      { region: 'Middle East', sku: 'ACM-1104', product_name: 'ThermalFuse Max', units_sold: 950, unit_price: 30.0, revenue: 28500.0 },
    ],
    total_revenue: 404950.0,
  },
  timelineSteps: [
    { type: 'browser_session', message: 'Isolated cloud browser spawned in secure sandbox' },
    { type: 'authentication', message: 'Workstation credentials injected into Acme ERP login form' },
    { type: 'navigation', message: 'Expanded Module Explorer: Reports & Audits -> Q3 Regional Sales Ledger' },
    { type: 'extraction_page_1', message: 'Harvested records 1-3 from Page 1 table matrix' },
    { type: 'pagination', message: 'Semantic vision located and clicked Next Page action' },
    { type: 'extraction_page_2', message: 'Harvested records 4-5 from Page 2. Notice: CSV direct export disabled' },
    { type: 'aggregation', message: 'Aggregated 5 records into structured schema format' },
  ],
};
