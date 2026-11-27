const supabaseUrl = "https://hicgwvonnshnfwawezrm.supabase.co";
const supabaseKey = "sb_publishable_kDRfhKyh8MLZhw-lVB6Szw_jHmh_gGm";
const supabaseClient = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

console.log("Supabase connected:", supabaseClient);

const enterBtn = document.getElementById("myButton");

if (enterBtn) {
    enterBtn.addEventListener("click", async () => {
        localStorage.setItem("enteredRetu", "true");
        window.location.href ="feed.html";
    });
}

const topProfileBtn = document.getElementById("topProfileBtn");
const profileDropdownPanel = document.getElementById("profileDropdownPanel");
const signedOutDropdown = document.getElementById("signedOutDropdown");
const signedInDropdown = document.getElementById("signedInDropdown");
const authSuccessBanner = document.getElementById("authSuccessBanner");
const googleSignInBtn = document.getElementById("googleSignInBtn");
const signOutBtn = document.getElementById("signOutBtn");

const dropdownColorCircle = document.getElementById("dropdownColorCircle");
const dropdownDisplayName = document.getElementById("dropdownDisplayName");
const dropdownUsername = document.getElementById("dropdownUsername");
const dropdownBio = document.getElementById("dropdownBio");

if (topProfileBtn && profileDropdownPanel) {
    topProfileBtn.addEventListener("click", () => {
        const isOpen = profileDropdownPanel.style.display === "block";
        profileDropdownPanel.style.display = isOpen ? "none" : "block";
    });
}

if (googleSignInBtn) {
    googleSignInBtn.addEventListener("click", async () => {
        sessionStorage.setItem("justSignedIn", "true");
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
        sessionStorage.removeItem("justSignedIn");
        await supabaseClient.auth.signOut();
    });
}

supabaseClient.auth.onAuthStateChange(async (event, session) => {
    const user = session?.user;

    if (user) {
        if (signedOutDropdown) signedOutDropdown.style.display = "none";
        if (signedInDropdown) signedInDropdown.style.display = "flex";

        // Automatically open dropdown & show success message right after Google login
        if (sessionStorage.getItem("justSignedIn") === "true") {
            if (profileDropdownPanel) profileDropdownPanel.style.display = "block";
            if (authSuccessBanner) authSuccessBanner.style.display = "block";
            sessionStorage.removeItem("justSignedIn");
        }

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
        if (dropdownColorCircle) dropdownColorCircle.style.backgroundColor = activeColor;
        if (dropdownDisplayName) dropdownDisplayName.textContent = profile?.display_name || fallbackName;
        if (dropdownUsername) dropdownUsername.textContent = "@" + (profile?.username || "user");
        if (dropdownBio) dropdownBio.textContent = profile?.bio || "Feel free to use your words to the world";
    } else {
        if (signedOutDropdown) signedOutDropdown.style.display = "block";
        if (signedInDropdown) signedInDropdown.style.display = "none";
        if (authSuccessBanner) authSuccessBanner.style.display = "none";
    }
});

