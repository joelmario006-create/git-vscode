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
const topProfileBtn = document.getElementById("topProfileBtn");
const topProfileRing = document.getElementById("topProfileRing");
const topProfileHead = document.getElementById("topProfileHead");
const topProfileBody = document.getElementById("topProfileBody");
const signInNotice = document.getElementById("signInNotice");
const userDisplayName = document.getElementById("userDisplayName");
const signOutBtn = document.getElementById("signOutBtn");

let currentLoggedInUser = null;

if (topProfileBtn) {
    topProfileBtn.addEventListener("click", () => {
        if (currentLoggedInUser) {
            window.location.href = "profile.html";
        } else if (signInNotice) {
            signInNotice.style.display = "block";
        }
    });
}

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
    currentLoggedInUser = user || null;

    if (user) {
        if (googleSignInBtn) googleSignInBtn.style.display = "none";
        if (signInNotice) signInNotice.style.display = "none";
        if (userProfileCard) userProfileCard.style.display = "flex";

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

        const activeColor = profile?.profile_color || "#007AFF";
        if (userDisplayName) userDisplayName.textContent = profile?.display_name || fallbackName;
        if (topProfileRing) topProfileRing.setAttribute("stroke", activeColor);
        if (topProfileHead) topProfileHead.setAttribute("stroke", activeColor);
        if (topProfileBody) topProfileBody.setAttribute("stroke", activeColor);
    } else {
        if (googleSignInBtn) googleSignInBtn.style.display = "flex";
        if (userProfileCard) userProfileCard.style.display = "none";
        if (topProfileRing) topProfileRing.setAttribute("stroke", "#0f172a");
        if (topProfileHead) topProfileHead.setAttribute("stroke", "#0f172a");
        if (topProfileBody) topProfileBody.setAttribute("stroke", "#0f172a");
    }
});