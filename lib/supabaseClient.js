// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fwoyrwiddhxkdqxegzzb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b3lyd2lkZGh4a2RxeGVnenpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU3NDMyMzAsImV4cCI6MjAzMTMxOTIzMH0.pBcCzrUujreNCq2sMHkkb2YR3ZbUjNmf457wL5DW8Hg';
export const supabase = createClient(supabaseUrl, supabaseKey);

export function jsonDeepParse(str) {
    try {
        if (str) {
            str = jsonParse(str);
            if (str && str.length && typeof str == 'object') {
                str.forEach(element => {
                    element = jsonDeepParse(element);
                });
            }
            else if (str && typeof str == 'object') {
                let keys = Object.keys(str);
                if (keys && keys.length) {
                    keys.forEach(key => {
                        str[key] = jsonDeepParse(str[key]);
                    });
                }
            }
            return str;
        }
        else {
            return str;
        }
    }
    catch (e) {
        return str;
    }
}