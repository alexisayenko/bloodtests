import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hvcfhywtbsxpgjxlvxww.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_29scWHcu3V3IJ7XnbkF5fw_okxFUQx1';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
