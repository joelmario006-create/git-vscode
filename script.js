const supabaseUrl = "https://hicgwvonnshnfwawezrm.supabase.co";
const supabaseKey = "sb_publishable_kDRfhKyh8MLZhw-lVB6Szw_jHmh_gGm";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase connected:", supabaseClient);

const enterBtn = document.getElementById("myButton");

if (enterBtn) {
    enterBtn.addEventListener("click", async () => {
        localStorage.setItem("enteredRetu", "true");
        window.location.href ="feed.html";
    });
}

const googleSignInBtn = document.getElementById("googleSignInBtn");
const userProfileCard = document.getElementById("userProfileCard");
const topProfileIconLink = document.getElementById("topProfileIconLink");
const topProfileColorDot = document.getElementById("topProfileColorDot");
const userDisplayName = document.getElementById("userDisplayName");
const signOutBtn = document.getElementById("signOutBtn");

if (googleSignInBtn) {
    googleSignInBtn.addEventListener("click", async () => {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin + "/git-vscode/feed.html"
            }
        });
        if (error) alert("Sign-in error: " + error.message);
    });
}

if (signOutBtn) {
    signOutBtn.addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
    });
}

supabaseClient.auth.onAuthStateChange(async (event, session) => {
    const user = session?.user;

    if (user) {
        if (googleSignInBtn) googleSignInBtn.style.display = "none";
        if (userProfileCard) userProfileCard.style.display = "flex";
        if (topProfileIconLink) topProfileIconLink.style.display = "flex";

        const fallbackName = user.user_metadata.full_name || user.email;

        let { data: profile } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (!profile) {
            const { data: newProfile } = await supabaseClient
                .from("profiles")
                .insert({
                    id: user.id,
                    display_name: fallbackName,
                    username: fallbackName.toLowerCase().replace(/\s+/g, "_"),
                    profile_color: "#007AFF"
                })
                .select()
                .single();
            profile = newProfile;
        }

        if (userDisplayName) userDisplayName.textContent = profile?.display_name || fallbackName;
        if (topProfileColorDot) topProfileColorDot.style.backgroundColor = profile?.profile_color || "#007AFF";
    } else {
        if (googleSignInBtn) googleSignInBtn.style.display = "flex";
        if (userProfileCard) userProfileCard.style.display = "none";
        if (topProfileIconLink) topProfileIconLink.style.display = "none";
    }
});