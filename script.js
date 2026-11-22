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