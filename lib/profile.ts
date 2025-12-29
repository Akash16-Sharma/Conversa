import { supabase } from "./supabaseClient";

export async function createProfile(userId: string, email?: string) {
 return await supabase.from('profiles').insert({
    id: userId,
    full_name: email?.split('@')[0],
 })   
}

export async function getProfile(userId: string) {
    return await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
}


export async function updateProfile(userId: string, data: any) {
    return await supabase.from('profiles').update(data).eq('id', userId);
}