const supabaseUrl = "https://hicgwvonnshnfwawezrm.supabase.co";
const supabaseKey = "sb_publishable_kDRfhKyh8MLZhw-lVB6Szw_jHmh_gGm";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase connected:", supabaseClient);

document.getElementById("myButton").addEventListener("click", function() 
{alert("Button was clicked!");});