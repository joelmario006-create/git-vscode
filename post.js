const publishVideoBtn = document.getElementById("publishVideoBtn");
const videoFileInput = document.getElementById("videoFileInput");
const videoCaptionInput = document.getElementById("videoCaptionInput");
const uploadStatusMsg = document.getElementById("uploadStatusMsg");
const feedContainer = document.querySelector(".scroll-container");

if (publishVideoBtn) {
    publishVideoBtn.addEventListener("click", async () => {
        if (!supabaseClient) {
            alert("Still connecting to Supabase — please wait a second and try again.");
            return;
        }

        const { data: { session } } = await supabaseClient.auth.getSession();
        const user = session?.user;

        if (!user) {
            uploadStatusMsg.style.color = "#f87171";
            uploadStatusMsg.textContent = "Please sign in with Google first to post a video.";
            return;
        }

        const file = videoFileInput?.files?.[0];
        if (!file) {
            uploadStatusMsg.style.color = "#f87171";
            uploadStatusMsg.textContent = "Please select a video file first.";
            return;
        }

        uploadStatusMsg.style.color = "#93c5fd";
        uploadStatusMsg.textContent = "Uploading video...";
        publishVideoBtn.disabled = true;

        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabaseClient.storage
            .from("videos")
            .upload(filePath, file);

        if (uploadError) {
            uploadStatusMsg.style.color = "#f87171";
            uploadStatusMsg.textContent = "Upload error: " + uploadError.message;
            publishVideoBtn.disabled = false;
            return;
        }

        const { data: publicData } = supabaseClient.storage
            .from("videos")
            .getPublicUrl(filePath);

        const { error: dbError } = await supabaseClient
            .from("videos")
            .insert({
                user_id: user.id,
                video_url: publicData.publicUrl,
                caption: videoCaptionInput?.value.trim() || ""
            });

        publishVideoBtn.disabled = false;

        if (dbError) {
            uploadStatusMsg.style.color = "#f87171";
            uploadStatusMsg.textContent = "Database error: " + dbError.message;
        } else {
            uploadStatusMsg.style.color = "#34d399";
            uploadStatusMsg.textContent = "Video posted!";
            if (videoFileInput) videoFileInput.value = "";
            if (videoCaptionInput) videoCaptionInput.value = "";
            loadLiveFeed();
        }
    });
}

async function loadLiveFeed() {
    if (!feedContainer || !supabaseClient) return;

    const { data: videos } = await supabaseClient
        .from("videos")
        .select("id, video_url, caption, user_id, created_at, profiles(display_name, username, profile_color)")
        .order("created_at", { ascending: false });

    if (!videos || videos.length === 0) return;

    const toast = document.getElementById("videoStageAuthToast");
    feedContainer.innerHTML = "";
    if (toast) feedContainer.appendChild(toast);

    videos.forEach((video) => {
        const creator = video.profiles || {};
        const creatorName = creator.display_name || "Creator";
        const creatorHandle = creator.username ? `@${creator.username}` : "";
        const creatorColor = creator.profile_color || "#007AFF";

        const section = document.createElement("section");
        section.className = "scroll-area";
        section.style.position = "relative";
        section.innerHTML = `
            <video src="${video.video_url}" loop playsinline controls style="width: 100%; height: 100%; object-fit: cover;"></video>
            <div style="position: absolute; bottom: 72px; left: 16px; right: 76px; color: #ffffff; font-family: Arial, sans-serif; text-shadow: 0 2px 8px rgba(0,0,0,0.85); pointer-events: auto;">
                <a href="user-page.html?id=${video.user_id}" style="display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: #ffffff; margin-bottom: 6px;">
                    <span style="width: 34px; height: 34px; border-radius: 50%; background-color: ${creatorColor}; display: inline-block; border: 2px solid #ffffff;"></span>
                    <div>
                        <div style="font-size: 14px; font-weight: 700;">${creatorName}</div>
                        <div style="font-size: 12px; color: #cbd5e1;">${creatorHandle}</div>
                    </div>
                </a>
                <p style="font-size: 14px; margin: 4px 0 0 0;">${video.caption || ""}</p>
            </div>
        `;
        feedContainer.appendChild(section);
    });
}

loadLiveFeed();