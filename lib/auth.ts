import { supabase } from "./supabaseClient";
import { createProfile } from "./profile";

export async function signUp(email: string, password: string) {

    const result= await supabase.auth.signUp({ email, password });

    const user = result.data.user;

    if(user){
        await createProfile(user.id, email);
    }
    return result;
}

export async function signIn(email: string, password: string) {

    return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {

    return await supabase.auth.signOut();
}