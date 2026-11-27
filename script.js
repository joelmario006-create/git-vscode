import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabaseUrl = "https://hicgwvonnshnfwawezrm.supabase.co";
const supabaseKey = "sb_publishable_kDRfhKyh8MLZhw-lVB6Szw_jHmh_gGm";
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// 1. Enter Platform button (index.html)
const enterBtn = document.getElementById("myButton");
if (enterBtn) {
    enterBtn.addEventListener("click", () => {
        window.location.href = "feed.html";
    });
}

// 2. Profile Dropdown & Google Auth (feed.html)
const profileDropdownPanel = document.getElementById("profileDropdownPanel");
const signedOutDropdown = document.getElementById("signedOutDropdown");
const signedInDropdown = document.getElementById("signedInDropdown");
const videoStageAuthToast = document.getElementById("videoStageAuthToast");
const googleSignInBtn = document.getElementById("googleSignInBtn");
const signOutBtn = document.getElementById("signOutBtn");

const dropdownColorCircle = document.getElementById("dropdownColorCircle");
const dropdownDisplayName = document.getElementById("dropdownDisplayName");
const dropdownUsername = document.getElementById("dropdownUsername");
const dropdownBio = document.getElementById("dropdownBio");

if (googleSignInBtn) {
    googleSignInBtn.addEventListener("click", async () => {
        const client = supabaseClient || (window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null);
        if (!client) {
            alert("Still connecting to Supabase — check your internet connection or refresh the page.");
            return;
        }
        sessionStorage.setItem("justSignedIn", "true");
        const { error } = await client.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin + "/git-vscode/feed.html"
            }
        });
        if (error) alert("Sign-in error: " + error.message);
    });
}

if (signOutBtn && supabaseClient) {
    signOutBtn.addEventListener("click", async () => {
        sessionStorage.removeItem("justSignedIn");
        await supabaseClient.auth.signOut();
    });
}

if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        const user = session?.user;

        if (user) {
            if (signedOutDropdown) signedOutDropdown.style.display = "none";
            if (signedInDropdown) signedInDropdown.style.display = "flex";

            if (sessionStorage.getItem("justSignedIn") === "true") {
                if (videoStageAuthToast) {
                    videoStageAuthToast.style.display = "block";
                    setTimeout(() => {
                        videoStageAuthToast.style.display = "none";
                    }, 4000);
                }
                sessionStorage.removeItem("justSignedIn");
            }

            const fallbackName = user.user_metadata.full_name || user.email;

            let { data: profile } = await supabaseClient
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();

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
        }
    });
}

export { supabaseClient };