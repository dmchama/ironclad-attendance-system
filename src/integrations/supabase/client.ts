// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://srzyxdcwtissxpdqrgcu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyenl4ZGN3dGlzc3hwZHFyZ2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNTM3NDMsImV4cCI6MjA2NDYyOTc0M30.U4JND-qHPo3DNXdFHdA8BeZn0sAZ9Gp5lTTkoVvm69g";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);