-- =============================================================================
-- KGOS X 2031 — SUPABASE POSTGRESQL PRODUCTION-GRADE SCHEMA (v2)
-- =============================================================================
-- Features: Full Relational Mapping, pgvector search support, Row Level Security,
-- Row-by-Row Auditing, Version tracking, Soft Deletes, and Custom RBAC.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- Vector embeddings support

-- Setup custom schema roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'kgos_admin') THEN
        CREATE ROLE kgos_admin;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'kgos_editor') THEN
        CREATE ROLE kgos_editor;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'kgos_viewer') THEN
        CREATE ROLE kgos_viewer;
    END IF;
END
$$;

-- ── 1. PROFILES TABLE (DIGITAL TWIN ROOT) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mission TEXT,
    vision TEXT,
    decision_style TEXT,
    learning_style TEXT,
    strengths TEXT[],
    weaknesses TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 2. GOALS TABLE (HORIZONS) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.goals (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    due_date DATE,
    category TEXT CHECK (category IN ('10 Year', '5 Year', 'Annual', 'Quarterly', 'Monthly')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 3. PROJECTS TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'PLANNING', 'ACTIVE', 'WAITING', 'COMPLETED', 'ARCHIVED')),
    priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    category TEXT NOT NULL, -- 'General', 'Research', 'Publishing'
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 4. TASKS TABLE ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id BIGINT REFERENCES public.projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED')),
    priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    category TEXT CHECK (category IN ('Business', 'Research', 'Government Exams', 'Health', 'Career', 'Content', 'Personal')),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 5. CRM LEADS TABLE (KAFS ERP) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leads (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    product_interest TEXT,
    status TEXT DEFAULT 'Lead' CHECK (status IN ('Lead', 'Contacted', 'Qualified', 'Sample Sent', 'Trial', 'Proposal', 'Customer', 'Repeat')),
    notes TEXT,
    next_follow_up DATE,
    opportunity_value NUMERIC(15, 2) DEFAULT 0.00,
    industry TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 6. UNIFIED DAILY LOGS & HEALTH TELEMETRY ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE UNIQUE NOT NULL,
    weight NUMERIC(5, 2),
    sleep_hours NUMERIC(4, 2),
    sleep_quality INT,
    water_intake_ml INT,
    exercise_mins INT,
    energy_level INT CHECK (energy_level >= 1 AND energy_level <= 10),
    mood_level INT CHECK (mood_level >= 1 AND mood_level <= 10),
    stress_level INT CHECK (stress_level >= 1 AND stress_level <= 10),
    calorie_intake_kcal INT,
    protein_intake_g INT,
    steps_count INT,
    heart_rate_resting INT,
    blood_pressure_sys INT,
    blood_pressure_dia INT,
    priorities TEXT[],
    wins TEXT[],
    challenges TEXT[],
    learnings TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 7. RESEARCH LITERATURE TABLE (RESEARCH OS) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.research_papers (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    status TEXT DEFAULT 'Planned' CHECK (status IN ('Planned', 'Reading', 'Summarized', 'Referenced')),
    summary TEXT,
    authors TEXT,
    journal TEXT,
    year TEXT,
    doi TEXT,
    abstract TEXT,
    citations INT DEFAULT 0,
    keywords TEXT,
    ai_summary TEXT,
    bibtex_key TEXT,
    citation_key TEXT,
    journal_impact_factor DOUBLE PRECISION,
    quartile TEXT,
    reading_progress INT DEFAULT 0 CHECK (reading_progress >= 0 AND reading_progress <= 100),
    pdf_url TEXT,
    bib_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 8. EXAMS PREPARATION TABLE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exams (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    application_date DATE,
    exam_date DATE,
    status TEXT NOT NULL,
    notes TEXT,
    study_hours NUMERIC(6, 2) DEFAULT 0.00,
    target_hours NUMERIC(6, 2),
    max_marks INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 9. KNOWLEDGE NOTES TABLE (KNOWLEDGE VAULT) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.knowledge_notes (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    tags TEXT[],
    category TEXT CHECK (category IN ('Notes', 'Research', 'Business Knowledge', 'Ideas', 'Government Exams', 'Career')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 10. DOCUMENTS INTELLIGENCE TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.documents (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    ocr_extracted_content TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 11. WEALTH TRANSACTIONS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE', 'INVESTMENT')),
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 12. RELATIONSHIPS / CRM CONTACTS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contacts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lead_id BIGINT REFERENCES public.leads(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    linkedin TEXT,
    type TEXT DEFAULT 'Business' CHECK (type IN ('Business', 'Personal')),
    relationship_score INT DEFAULT 50 CHECK (relationship_score >= 1 AND relationship_score <= 100),
    interaction_count INT DEFAULT 0,
    last_interaction DATE,
    notes TEXT,
    tags TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 13. OPPORTUNITIES RADAR TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.opportunities (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('Grants', 'Conferences', 'Recruiters', 'Partnerships', 'Customers', 'Export')),
    roi_score INT CHECK (roi_score >= 1 AND roi_score <= 100),
    revenue_impact NUMERIC(15, 2) DEFAULT 0.00,
    alignment_score INT CHECK (alignment_score >= 1 AND alignment_score <= 100),
    effort_score INT CHECK (effort_score >= 1 AND effort_score <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 14. TIME ALLOCATIONS TABLE ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.time_allocations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Health', 'Business', 'Research', 'Exams', 'Career', 'Relationships', 'Learning', 'Brand')),
    hours_planned NUMERIC(4, 2) NOT NULL,
    hours_actual NUMERIC(4, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 15. PRODUCTS CATALOG TABLE (KAFS ERP) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 16. SUPPLIERS LOGISTICS TABLE (KAFS ERP) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.suppliers (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 17. VECTOR DB DOCUMENT STORE (pgvector) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vector_store (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id BIGINT REFERENCES public.documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_content TEXT NOT NULL,
    embedding VECTOR(1536), -- OpenAI Ada-002 dimension size
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 18. SYSTEM AUDIT LOGS TABLE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    table_name TEXT NOT NULL,
    record_id BIGINT NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 19. FORMULATIONS TABLE ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.formulations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lead_id BIGINT REFERENCES public.leads(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    target_application TEXT NOT NULL,
    processing_notes TEXT,
    target_viscosity DOUBLE PRECISION,
    target_gel_strength DOUBLE PRECISION,
    status TEXT NOT NULL,
    cost_per_kg NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 20. INGREDIENTS TABLE (KAFS ERP) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ingredients (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    chemical_name TEXT,
    category TEXT NOT NULL, -- 'Hydrocolloid' | 'Emulsifier' | 'Starch' etc.
    type TEXT NOT NULL,
    moisture_max NUMERIC(5, 2),
    ash_max NUMERIC(5, 2),
    acid_insoluble_matter_max NUMERIC(5, 2),
    lead_ppm NUMERIC(5, 3),
    arsenic_ppm NUMERIC(5, 3),
    cadmium_ppm NUMERIC(5, 3),
    mercury_ppm NUMERIC(5, 3),
    mesh_size_spec TEXT,
    ph_spec_range TEXT,
    viscosity_spec_range TEXT,
    gel_strength_spec_range TEXT,
    micro_tvc_cfu_g_max INT,
    micro_yeast_mold_cfu_g_max INT,
    micro_coliforms_cfu_g_max INT,
    micro_salmonella_neg BOOLEAN,
    micro_ecoli_neg BOOLEAN,
    regulatory_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 21. FORMULATION INGREDIENTS BRIDGE (RECIPE RATIOS) ──────────────────────
CREATE TABLE IF NOT EXISTS public.formulation_ingredients (
    id BIGSERIAL PRIMARY KEY,
    formulation_id BIGINT NOT NULL REFERENCES public.formulations(id) ON DELETE CASCADE,
    ingredient_id BIGINT NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    percentage NUMERIC(5, 2) NOT NULL
);

-- ── 22. FORMULATION VERSIONS (LAB TRIAL LOGS) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.formulation_versions (
    id BIGSERIAL PRIMARY KEY,
    formulation_id BIGINT NOT NULL REFERENCES public.formulations(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    recipe_json TEXT NOT NULL, -- Snapshot of ingredient percentages [{ingredient_id, pct}]
    processing_notes TEXT,
    cost_per_kg NUMERIC(15, 2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    viscosity_actual DOUBLE PRECISION,
    gel_strength_actual DOUBLE PRECISION,
    ph_actual NUMERIC(4, 2),
    solid_content_pct NUMERIC(5, 2),
    active_polymer_pct NUMERIC(5, 2),
    ash_content_pct NUMERIC(5, 2),
    turbidity_ntu DOUBLE PRECISION,
    syneresis_pct NUMERIC(5, 2),
    gelling_temp_c DOUBLE PRECISION,
    melting_temp_c DOUBLE PRECISION,
    tpa_hardness DOUBLE PRECISION,
    tpa_cohesiveness DOUBLE PRECISION,
    tpa_elasticity DOUBLE PRECISION,
    tpa_springiness DOUBLE PRECISION
);

-- ── 23. SUPPLIER INGREDIENTS PRICING LEDGER ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.supplier_ingredients (
    id BIGSERIAL PRIMARY KEY,
    supplier_id BIGINT NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    ingredient_id BIGINT NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    price_per_kg NUMERIC(15, 2) NOT NULL,
    lead_time_days INT NOT NULL,
    purity_grade TEXT NOT NULL, -- e.g. Food Grade
    certification TEXT, -- e.g. Kosher, Halal, FSSAI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 24. BATCH RECORDS (MANUFACTURING TELEMETRY) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.batch_records (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    batch_id TEXT NOT NULL,
    formulation_id BIGINT REFERENCES public.formulations(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    target_weight NUMERIC(15, 2) NOT NULL,
    actual_weight NUMERIC(15, 2),
    yield NUMERIC(5, 2),
    status TEXT NOT NULL,
    sign_date DATE NOT NULL,
    end_date DATE,
    qc_passed BOOLEAN,
    ambient_temp_c NUMERIC(4, 1),
    ambient_humidity_pct NUMERIC(4, 1),
    equipment_id TEXT,
    blending_speed_rpm INT,
    blending_time_mins INT,
    moisture_content_pct NUMERIC(4, 2),
    mesh_pass_pct NUMERIC(5, 2),
    sieve_oversize_pct NUMERIC(5, 2),
    lot_number TEXT,
    bag_weight_kg NUMERIC(5, 2),
    total_bags_produced INT,
    rejection_count INT,
    deviation_notes TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 25. BATCH INGREDIENT LOTS (LOT TRACEABILITY BRIDGE) ──────────────────────
CREATE TABLE IF NOT EXISTS public.batch_ingredient_lots (
    id BIGSERIAL PRIMARY KEY,
    batch_record_id BIGINT NOT NULL REFERENCES public.batch_records(id) ON DELETE CASCADE,
    ingredient_id BIGINT NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    vendor_lot_number TEXT NOT NULL,
    quantity_used_kg NUMERIC(15, 2) NOT NULL
);

-- ── 26. B2B SAMPLES REQUESTS AND TRIALS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sample_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lead_id BIGINT REFERENCES public.leads(id) ON DELETE SET NULL,
    formulation_id BIGINT REFERENCES public.formulations(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    quantity TEXT NOT NULL,
    dispatch_date DATE,
    status TEXT DEFAULT 'Planned' CHECK (status IN ('Planned', 'In Progress', 'Completed', 'Failed')),
    application_category TEXT NOT NULL,
    food_matrix_ph NUMERIC(4, 2),
    calcium_content_ppm INT,
    processing_type TEXT,
    target_shelf_life_mths INT,
    storage_temp_c NUMERIC(4, 1),
    shear_conditions TEXT,
    salt_type_ppm TEXT,
    fat_content_pct NUMERIC(4, 2),
    protein_content_pct NUMERIC(4, 2),
    solids_non_fat_pct NUMERIC(4, 2),
    sweetener_type_pct TEXT,
    syneresis_noted BOOLEAN,
    sensory_feedback JSONB,
    feedback_rating INT,
    failure_mode TEXT,
    trial_outcome TEXT,
    next_step_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 27. PHD APPLICATIONS (ACADEMIC TRACKER) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.phd_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    university TEXT NOT NULL,
    program TEXT NOT NULL,
    deadline DATE NOT NULL,
    status TEXT DEFAULT 'Researching' CHECK (status IN ('Researching', 'Contacted', 'Applied', 'Accepted', 'Rejected')),
    qs_ranking INT,
    us_news_ranking INT,
    gre_verbal INT,
    gre_quantitative INT,
    gre_analytical NUMERIC(2, 1),
    toefl_total INT,
    ielts_score NUMERIC(2, 1),
    professor_name TEXT,
    advisor_research_area TEXT,
    advisor_email TEXT,
    portal_url TEXT,
    application_fee NUMERIC(10, 2),
    lor_status TEXT,
    sop_status TEXT DEFAULT 'Not Started' CHECK (sop_status IN ('Not Started', 'Drafting', 'Review', 'Done')),
    scholarship TEXT,
    funding_amount NUMERIC(15, 2),
    stipend_amt_annual NUMERIC(15, 2),
    tuition_waiver_pct NUMERIC(5, 2),
    sop_draft_url TEXT,
    cv_draft_url TEXT,
    personal_statement_url TEXT,
    transcripts_uploaded BOOLEAN DEFAULT FALSE,
    i20_status TEXT DEFAULT 'Not Applicable' CHECK (i20_status IN ('Not Applicable', 'Pending', 'Issued')),
    sevis_paid BOOLEAN DEFAULT FALSE,
    visa_interview_date DATE,
    visa_status TEXT DEFAULT 'Not Applicable' CHECK (visa_status IN ('Not Applicable', 'Pending', 'Approved', 'Denied')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 28. ADVISOR CONTACTS (PHD CORRESPONDENCE LOGS) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.advisor_contacts (
    id BIGSERIAL PRIMARY KEY,
    phd_application_id BIGINT NOT NULL REFERENCES public.phd_applications(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('Cold Email', 'Zoom Interview', 'In Person', 'Follow Up')),
    subject TEXT NOT NULL,
    content_summary TEXT NOT NULL,
    response_received BOOLEAN NOT NULL DEFAULT FALSE,
    reply_date DATE,
    response_delay_days INT,
    sentiment TEXT CHECK (sentiment IN ('Positive', 'Neutral', 'Negative', 'No Reply')),
    next_step TEXT,
    follow_up_due_date DATE,
    correspondence_history TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 29. STUDY SESSIONS TABLE ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exam_id BIGINT REFERENCES public.exams(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    duration_minutes INT NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 30. STUDY TOPICS TABLE ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_topics (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exam_id BIGINT REFERENCES public.exams(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL,
    importance INT NOT NULL,
    syllabus_weightage_pct NUMERIC(5, 2),
    mastery_level INT DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
    last_revised DATE,
    next_revision DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 31. FLASHCARDS TABLE (SM-2 SPACED REPETITION) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.flashcards (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    study_topic_id BIGINT NOT NULL REFERENCES public.study_topics(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    ease_factor NUMERIC(4, 2) DEFAULT 2.50 NOT NULL,
    interval_days INT DEFAULT 0 NOT NULL,
    repetitions INT DEFAULT 0 NOT NULL,
    next_review TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 32. MOCK TESTS TABLE ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mock_tests (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exam_id BIGINT REFERENCES public.exams(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    time_taken INT NOT NULL,
    date_taken DATE NOT NULL,
    questions TEXT, -- JSON string
    error_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 33. CONTENT PIECES TABLE ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_pieces (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('LinkedIn', 'Newsletter', 'Article', 'Tweet', 'Thread')),
    status TEXT NOT NULL CHECK (status IN ('Idea', 'Draft', 'Review', 'Scheduled', 'Published')),
    content TEXT,
    tags TEXT,
    scheduled_date DATE,
    published_date DATE,
    impressions INT,
    engagements INT,
    platform TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 34. KNOWLEDGE NODES TABLE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.knowledge_nodes (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Person', 'Research', 'Ingredient', 'Project', 'Company', 'Idea', 'Document', 'Customer', 'Publication', 'Task')),
    content TEXT,
    tags TEXT,
    linked_ids TEXT NOT NULL, -- JSON string of number[]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 35. AGENT MEMORY TABLE ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_memory (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('fact', 'context', 'task', 'preference')),
    related_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 36. NOTIFICATIONS TABLE ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 37. HEALTH GOALS TABLE ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.health_goals (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    metric TEXT NOT NULL CHECK (metric IN ('weight', 'sleep', 'exercise', 'water', 'energy')),
    target NUMERIC(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 38. BUDGET CATEGORIES TABLE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.budget_categories (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    monthly_limit NUMERIC(15, 2) NOT NULL,
    spent NUMERIC(15, 2) NOT NULL,
    month TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 39. AUTOMATION RULES TABLE ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.automation_rules (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    trigger TEXT NOT NULL,
    conditions TEXT NOT NULL, -- JSON string
    actions TEXT NOT NULL, -- JSON string
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_run TIMESTAMP WITH TIME ZONE,
    run_count INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks (user_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_user_status ON public.leads (user_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs (user_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions (user_id, date);
CREATE INDEX IF NOT EXISTS idx_formulations_user ON public.formulations (user_id);
CREATE INDEX IF NOT EXISTS idx_batch_records_user ON public.batch_records (user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON public.study_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_study_topics_user ON public.study_topics (user_id);
CREATE INDEX IF NOT EXISTS idx_phd_applications_user ON public.phd_applications (user_id);
CREATE INDEX IF NOT EXISTS idx_sample_requests_user ON public.sample_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_topic ON public.flashcards (user_id, study_topic_id);
CREATE INDEX IF NOT EXISTS idx_vector_store_embedding ON public.vector_store USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- =============================================================================
-- AUTOMATED TRIGGER FUNCTIONS (updated_at)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_update_goals
    BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_update_projects
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_update_tasks
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_update_leads
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_update_formulations
    BEFORE UPDATE ON public.formulations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vector_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulation_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulation_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_ingredient_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phd_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

-- Dynamic RLS policies for multi-tenancy
CREATE POLICY "Users can only read/write their own profiles" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage their own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own leads" ON public.leads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own daily_logs" ON public.daily_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own research papers" ON public.research_papers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own exams" ON public.exams FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own knowledge notes" ON public.knowledge_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own documents" ON public.documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own contacts" ON public.contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own opportunities" ON public.opportunities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own time allocations" ON public.time_allocations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own products" ON public.products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own suppliers" ON public.suppliers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own formulations" ON public.formulations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own ingredients" ON public.ingredients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own formulation_ingredients" ON public.formulation_ingredients FOR ALL USING (
    EXISTS (SELECT 1 FROM public.formulations WHERE public.formulations.id = formulation_id AND public.formulations.user_id = auth.uid())
);
CREATE POLICY "Users can manage their own formulation_versions" ON public.formulation_versions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.formulations WHERE public.formulations.id = formulation_id AND public.formulations.user_id = auth.uid())
);
CREATE POLICY "Users can manage their own supplier_ingredients" ON public.supplier_ingredients FOR ALL USING (
    EXISTS (SELECT 1 FROM public.suppliers WHERE public.suppliers.id = supplier_id AND public.suppliers.user_id = auth.uid())
);
CREATE POLICY "Users can manage their own batch_records" ON public.batch_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own batch_ingredient_lots" ON public.batch_ingredient_lots FOR ALL USING (
    EXISTS (SELECT 1 FROM public.batch_records WHERE public.batch_records.id = batch_record_id AND public.batch_records.user_id = auth.uid())
);
CREATE POLICY "Users can manage their own sample_requests" ON public.sample_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own phd_applications" ON public.phd_applications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own advisor_contacts" ON public.advisor_contacts FOR ALL USING (
    EXISTS (SELECT 1 FROM public.phd_applications WHERE public.phd_applications.id = phd_application_id AND public.phd_applications.user_id = auth.uid())
);
CREATE POLICY "Users can manage their own study_sessions" ON public.study_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own study_topics" ON public.study_topics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own flashcards" ON public.flashcards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own mock_tests" ON public.mock_tests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own content_pieces" ON public.content_pieces FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own knowledge_nodes" ON public.knowledge_nodes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own agent_memory" ON public.agent_memory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own health_goals" ON public.health_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own budget_categories" ON public.budget_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own automation_rules" ON public.automation_rules FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own vector chunks" ON public.vector_store FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.documents 
        WHERE public.documents.id = public.vector_store.document_id 
        AND public.documents.user_id = auth.uid()
    )
);
