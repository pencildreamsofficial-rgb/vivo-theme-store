# Vivo Theme Store

Files: index.html, download.html, admin.html, style.css, app.js, admin.js, theme.js, videos.json

Upload ALL files to the root of your GitHub repository (replace the old ones).

## Editing content
Use admin.html (or edit videos.json directly on GitHub).
- section / category: latest, premium, members (shown in Premium), live, widgets
- premiumMembers: list of { "name": "...", "image": "https://..." } shown above Recent Videos
- settings: youtubeChannel, telegram, membershipUrl (the "Be a Premium Member" link)
- Video password: use admin.html, it saves videoPWHash (hidden). A plain "videoPW" in videos.json still works.

Note: ZIP links in videos.json are public, so the password is a light gate, not strong security.
