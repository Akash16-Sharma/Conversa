import { supabase } from "./supabaseClient";

export async function getMatches(myProfile:any) {
    return supabase
    .from('profiles')
    .select('*')
    .eq('native_language', myProfile.learning_language)
    .eq('learning_language', myProfile.native_language)
    .neq('id', myProfile.id)
}