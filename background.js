chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message.type === "search_track") {
            getTracks(message.query).then(data => {
                sendResponse({ success: true, data: data });
            });

        }
        else if (message.type === "get_comments") {
            getComments(message.query, message.max_comments).then(data => {
                sendResponse({ success: true, data: data })
            });
        }
        else {
            sendResponse({ success: false, data: "bruh" })
        }
        //burası sürekli true olucak ;)
        return true;
    }
)

async function getTracks(query) {

    const url = new URL("https://api-v2.soundcloud.com/search");
    const result = await chrome.storage.local.get("sc_client_id");
    const client_id = result.sc_client_id;


    url.searchParams.set("q", query);
    url.searchParams.set("client_id", client_id)
    url.searchParams.set("limit", "20");

    const response = await (fetch(url));

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return data;
}

async function getComments(track_id, max_comments) {

    const result = await chrome.storage.local.get("sc_client_id");
    const client_id = result.sc_client_id;
    const url = new URL(`https://api-v2.soundcloud.com/tracks/${track_id}/comments?threaded=1&client_id=${client_id}&limit=20&offset=0&linked_partitioning=1`)


    let comments = []
    let sorted_comments = []

    let response = await (fetch(url));

    let data = await response.json()

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
    }

    comments.push(...data.collection)
    while (data.next_href && comments.length < max_comments) {
        response = await fetch(data.next_href);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        data = await response.json();

        comments.push(...data.collection);
    }

    comments.forEach((comment) => {
        if (comment.kind === "comment") {
            sorted_comments.push(
                {
                    timestamp: comment.timestamp,
                    avatar_url: comment.user.avatar_url,
                    body: comment.body
                }
            )
        }
    })

    sorted_comments.sort((a, b) => a.timestamp - b.timestamp);
    return sorted_comments;
}


chrome.webRequest.onBeforeRequest.addListener(
    async (details) => {
        const url = new URL(details.url);

        if (url.pathname === "/oauth/session") {
            const clientID = url.searchParams.get("client_id");

            if (clientID) {
                await chrome.storage.local.set({
                    sc_client_id: clientID
                })
            }
            else {
                console.log("client id yok")
            }
        }
    },
    {
        urls: ["*://*.soundcloud.com/*"]
    }
);