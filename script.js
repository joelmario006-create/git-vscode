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

if (googleSignInBtn) {
    googleSignInBtn.addEventListener("click", async () => {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.orgin + "/feed.html"
            }

        });

        if (error) {
            alert ("Sign-in error: " + error.message);
        }
    });

}

async function checkUser () {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user && googleSignInBtn) {
        const name = user.user_metadata.full_name || user.email;
        googleSignInBtn.textContent = "Signed in: " + name;
    }
}

checkUser();

