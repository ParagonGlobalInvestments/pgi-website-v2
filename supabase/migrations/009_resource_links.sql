-- Populate link_url for all 26 "Coming Soon" resources with Google Drive links
-- Also update stock pitch descriptions to clearly label the semester

-- ============================================================
-- General tab — Career Prep (2)
-- ============================================================

UPDATE resources
SET link_url = 'https://drive.google.com/drive/folders/1p2vGwqCcbZ5N-wMowhj_MAAZi1h0nTxG?usp=sharing'
WHERE title = 'Past Interview Questions';

UPDATE resources
SET link_url = 'https://drive.google.com/file/d/1EJNZDIoqottYbE2cDEt_qFTOopsRakAE/view?usp=sharing'
WHERE title = 'Excel Shortcuts';

-- ============================================================
-- Value tab — Value Education (2)
-- ============================================================

UPDATE resources
SET link_url = 'https://drive.google.com/drive/folders/1IDYoA4gQecY7-pmpdc2mlSeSy9GLf1ya?usp=sharing'
WHERE title = 'Value Education — Week 1';

UPDATE resources
SET link_url = 'https://drive.google.com/drive/folders/10KojcByNR-7Bhng5Gf-bpq4Mt3ClkFpw?usp=sharing'
WHERE title = 'Value Education — Week 4';

-- ============================================================
-- Value tab — IB Technicals (9)
-- All from BIWS Guides → Advanced/Recommended
-- ============================================================

UPDATE resources
SET link_url = 'https://drive.google.com/file/d/15zBAr9lly5q-LJzAR3h0i2pE7KvYlBA5/view?usp=sharing'
WHERE title = 'Core Concepts';

UPDATE resources
SET link_url = 'https://drive.google.com/file/d/1A4zLIJ35B_X7ZGux34akcT3cPHV91G0J/view?usp=sharing'
WHERE title = 'Accounting — 3 Statements';

UPDATE resources
SET link_url = 'https://drive.google.com/file/d/1P2dDEIB_EoqgtHVTJUOjmLR-sYQc7Uwq/view?usp=sharing'
WHERE title = 'Advanced Accounting & Projecting';

UPDATE resources
SET link_url = 'https://drive.google.com/file/d/14S4ZeUX4z1-WoTpqbJ9rCHLdGJg4SP17/view?usp=sharing'
WHERE title = 'Equity, EV, and Valuation Multiples';

UPDATE resources
SET link_url = 'https://drive.google.com/file/d/1uEN1P3k0i0oH2dnuK4vWbwzPJZkYsFTb/view?usp=sharing'
WHERE title = 'DCF';

UPDATE resources
SET link_url = 'https://drive.google.com/file/d/1mkhW-fyxBPVr3vFAi-zENw_xDsq8dnsN/view?usp=sharing'
WHERE title = 'Merger Model';

UPDATE resources
SET link_url = 'https://drive.google.com/file/d/1rGDU0-DUNncoL8X5BtF7ui1xMa80tMmz/view?usp=sharing'
WHERE title = 'LBO';

UPDATE resources
SET link_url = 'https://drive.google.com/file/d/1Vp82T85Q2IvmADU2RP3y0wsiHkxg4iDt/view?usp=sharing'
WHERE title = 'DCM, ECM, Lev Fin';

UPDATE resources
SET link_url = 'https://drive.google.com/file/d/1sc26KTJqOlMnuqFIHySoPFeVcRw5XfD0/view?usp=sharing'
WHERE title = 'Private Companies';

-- ============================================================
-- Value tab — Financial Modeling (1)
-- ============================================================

UPDATE resources
SET link_url = 'https://drive.google.com/file/d/1c9BAflZF8v54DaK64Idbaa8oauc_MUIu/view?usp=sharing'
WHERE title = '3 Statement Model Guide';

-- ============================================================
-- Value tab — Stock Pitches (10)
-- Update both link_url AND description to label the semester
-- ============================================================

-- CRWD — CrowdStrike (Fall 2024, Pod 6)
UPDATE resources
SET link_url = 'https://drive.google.com/drive/folders/185-r2On0-8WzPxcAGXz9UgB-b03vWQRd?usp=sharing',
    description = 'Investment pitch — Fall 2024'
WHERE title = 'NASDAQ: CRWD — CrowdStrike';

-- CYTK — Cytokinetics (Fall 2024, Pod 1)
UPDATE resources
SET link_url = 'https://drive.google.com/drive/folders/1aQLdV-tq0EYOKKHgXOEntsm5mw5L6CWf?usp=sharing',
    description = 'Investment pitch — Fall 2024'
WHERE title = 'NASDAQ: CYTK — Cytokinetics';

-- FRPT — Freshpet (Spring 2025, Pod 3)
UPDATE resources
SET link_url = 'https://drive.google.com/drive/folders/1cCcC904dGiZIMVpmH7kw12XPAr6JSMEq?usp=sharing',
    description = 'Investment pitch — Spring 2025'
WHERE title = 'NASDAQ: FRPT — Freshpet';

-- HOOD — Robinhood (Spring 2025, Pod 4)
UPDATE resources
SET link_url = 'https://drive.google.com/drive/folders/1GBp-RTu_JEjXvtcz1tiWXMo5gPI4fGDY?usp=sharing',
    description = 'Investment pitch — Spring 2025'
WHERE title = 'NASDAQ: HOOD — Robinhood';

-- OS — OneStream (Fall 2024, Pod 3)
UPDATE resources
SET link_url = 'https://drive.google.com/drive/folders/1tQ5YTwEyPPsg-hw47UkfGzqaOQwiDkKa?usp=sharing',
    description = 'Investment pitch — Fall 2024'
WHERE title = 'NASDAQ: OS — OneStream';

-- PINC — Premier (Spring 2025, Pod 7)
UPDATE resources
SET link_url = 'https://drive.google.com/drive/folders/197GVn3uXfS4Vy5RqclsC2F-uKGkSUAfC?usp=sharing',
    description = 'Investment pitch — Spring 2025'
WHERE title = 'NASDAQ: PINC — Premier';

-- DLR — Digital Realty (Fall 2024, Pod 4)
UPDATE resources
SET link_url = 'https://drive.google.com/drive/folders/1u7rUwDeEzo1LDehsqxmc2AJwQEk9T64N?usp=sharing',
    description = 'Investment pitch — Fall 2024'
WHERE title = 'NYSE: DLR — Digital Realty';

-- LEA — Lear Corporation (Fall 2024, Pod 5)
UPDATE resources
SET link_url = 'https://drive.google.com/drive/folders/1brpxlx6rMt6TJtglvtRDskZAcNfr6Jxp?usp=sharing',
    description = 'Investment pitch — Fall 2024'
WHERE title = 'NYSE: LEA — Lear Corporation';

-- NKE — Nike (Spring 2025, Pod 5)
UPDATE resources
SET link_url = 'https://drive.google.com/drive/folders/1x39KpJGyoUsGMWCRutHffbNzllHkiSFT?usp=sharing',
    description = 'Investment pitch — Spring 2025'
WHERE title = 'NYSE: NKE — Nike';

-- NVO — Novo Nordisk (Spring 2025, Pod 2)
UPDATE resources
SET link_url = 'https://drive.google.com/drive/folders/18I17zyPeg562X4Zl-tTKLDRv3IPcczwU?usp=sharing',
    description = 'Investment pitch — Spring 2025'
WHERE title = 'NYSE: NVO — Novo Nordisk';
