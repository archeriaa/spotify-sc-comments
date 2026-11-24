//query




//global değişkenler,
let SureDegerMS = 0;
let maxSureMS = 0;

let SarkiDeger = null;
let SanatciDeger = null

let SureintervalId = null;
let SarkiintervalId = null;

let SureDeger = 0;

let maxSure = 0;

let sonGosterilenTimestamp = 0;



function SuretakibiBaslat(comments) {
    if (SureintervalId) return;
    SureintervalId = setInterval(() => {
        const MSelement = document.querySelector('.Mm38FVy4i2GXLReeARxE');
        if (MSelement) {
            const yeniDeger = MSelement.textContent.trim();
            if (yeniDeger !== "-:--" && yeniDeger !== "" && yeniDeger !== SureDeger) {
                SureDeger = yeniDeger;
                SureDegerMS = msCevirme(yeniDeger);
                if (Number.isNaN(SureDegerMS)) {
                    console.log("hatalı ms");
                    return;
                }
                YorumSureKontrolEt(comments);
            }
        }
    }, 1500);
}

function getMaxMS() {
    getMaxMSIntervalId = setInterval(() => {
        const MAXMSelement = document.querySelector('.Nocfu_yQMHmVKO9vKYio')
        if (MAXMSelement) {
            const max_sec_str = MAXMSelement.textContent.trim();
            if (max_sec_str !== "-:--" && max_sec_str !== "") {
                maxSureMS = msCevirme(max_sec_str);
                clearInterval(getMaxMSIntervalId);
            }
        }

    },);
}

function SuretakibiDurdur() {
    if (SureintervalId) {
        clearInterval(SureintervalId);
        SureintervalId = null;
        // console.log("sure takip dur");
        const comment_block = document.querySelector('#comment-div-archer')
        if (comment_block) {
            comment_block.remove();
        }
    }
}


function SarkitakibiBaslat() {
    if (SarkiintervalId) return;
    SarkiintervalId = setInterval(() => {

        const sanatcilarElement = document.querySelectorAll('[data-testid="now-playing-widget-v2-byline"]')
        const sarkiElement = document.querySelector('[data-testid="context-item-link"]');

        if (!sarkiElement || !sanatcilarElement || sanatcilarElement.length === 0) {
            console.log("sarki aranıyor")
            if (SureintervalId) { SuretakibiDurdur() };
            return;
        }
        const yeniDeger = sarkiElement.textContent.trim();
        if (yeniDeger && yeniDeger !== SarkiDeger) {
            let sanatcilar = []
            sanatcilarElement.forEach(sanatci => {
                sanatcilar.push(sanatci.textContent)
            });
            const tekSanatcilar = [...new Set(sanatcilar)];
            let stringSanatcilar = tekSanatcilar.join(" ")
            if (stringSanatcilar) {
                SarkiDeger = yeniDeger
                SanatciDeger = stringSanatcilar
                SuretakibiDurdur()
                // console.log("eski intervel temizlendi")
                main(SarkiDeger, SanatciDeger)
            }
        }
    }, 500)
}

function SarkitakibiDurdur() {
    if (SarkiintervalId) {
        clearInterval(SarkiintervalId);
        SarkiintervalId = null;
        // console.log("sarki takip durdur")
    }
}

function sendMessage(message, query, max_comments) {

    return new Promise((resolve, reject) => {
        // console.log("backgrounda yapılan istek;", message, query, max_comments);
        chrome.runtime.sendMessage(
            {
                type: message,
                query: query,
                max_comments: max_comments
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }
                resolve(response.data);
            }
        );

    });
}

function msCevirme(saniye) {
    const [minutes, seconds] = saniye.split(":").map(Number)
    return (minutes * 60 + seconds) * 1000
}

function saniyeCevirme(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function YorumSureKontrolEt(comments) {
    const enYakinYorum = comments.reduce((prev, curr) => {
        return Math.abs(curr.timestamp - SureDegerMS) < Math.abs(prev.timestamp - SureDegerMS) ? curr : prev;
    });

    const fark = Math.abs(enYakinYorum.timestamp - SureDegerMS)

    if (fark <= 500 && sonGosterilenTimestamp !== enYakinYorum.timestamp) {
        sonGosterilenTimestamp = enYakinYorum.timestamp
        olustur(enYakinYorum)
    }
}

async function main(sarkiIsmi, sanatciIsmi) {

    const resultLocalStorage = await chrome.storage.local.get("sc_client_id");
    if (!resultLocalStorage.sc_client_id) { console.error("client id bulunamadı"); return }
    getMaxMS();
    console.log("---------------")
    console.log(`\nGönderilecek değer; ${sarkiIsmi} ${sanatciIsmi}`)
    try {
        const response = await sendMessage(
            "search_track",
            `${sarkiIsmi} ${sanatciIsmi}`
        )

        let gelen_sarkilar = response.collection
        // console.log(gelen_sarkilar)
        let puan_tablosu = [] //puani en yuksek olan sarkinin yorumlarini çekmek içn table,

        if (gelen_sarkilar.length !== 0) {
            gelen_sarkilar.forEach(sarki => {
                if (!sarki.public || !sarki.commentable || sarki.comment_count === 0) { return; }
                let sarki_puani = 0
                if (sarki.permalink_url.includes(sarkiIsmi.toLowerCase()) || sarki.permalink_url.includes(sanatciIsmi.toLowerCase())) { sarki_puani += 6 }
                if (sarki.label_name !== "" && sarki.label_name !== undefined) { sarki_puani += 1 }
                if (sarki.genre !== "" && sarki.genre !== undefined) { sarki_puani += 1 }
                if (sarki.tag_list !== "" && sarki.tag_list !== undefined) { sarki_puani += 1 }
                if (sarki.publisher_metadata && sarki.publisher_metadata.isrc) { sarki_puani += 2 }
                if (sarki.title.toLowerCase().includes("remix") || sarki.title.toLowerCase().includes("sped up") || sarki.title.toLowerCase().includes("slowed")) { sarki_puani -= 4 }
                puan_tablosu.push({
                    sarki: sarki,
                    sarki_puani: sarki_puani,
                    duration: sarki.full_duration,
                    playback: sarki.playback_count,
                    likes: sarki.likes_count,
                    repost: sarki.reposts_count,
                    comment: sarki.comment_count
                })
            });

            enCokPuanliSarki = puan_tablosu.sort((a, b) => b.sarki_puani - a.sarki_puani)[0];

            // console.log("---------------------------------")
            // puan_tablosu.forEach(item => {
            //     console.log(`%c ${item.sarki.title} -> Güncel Puan: ${item.sarki_puani}`, 'color: red;');
            // });

            // console.log("MAX SÜRE:", maxSureMS)

            const enYakinSureliSarki = puan_tablosu.reduce((enYakin, sarki) => {
                const fark = Math.abs(sarki.duration - maxSureMS)

                if (fark < Math.abs(enYakin.duration - maxSureMS)) {
                    return sarki
                }
                return enYakin
            })

            const enCokDinlenen = [...puan_tablosu].sort((a, b) => b.playback - a.playback)[0];
            const enCokBegenilen = [...puan_tablosu].sort((a, b) => b.likes - a.likes)[0];
            const enCokRepost = [...puan_tablosu].sort((a, b) => b.repost - a.repost)[0];
            const enCokYorum = [...puan_tablosu].sort((a, b) => b.comment - a.comment)[0];

            //hepsine puani veriyoruz
            enYakinSureliSarki.sarki_puani += 1;
            enCokDinlenen.sarki_puani += 3;
            enCokBegenilen.sarki_puani += 3;
            enCokRepost.sarki_puani += 3;
            enCokYorum.sarki_puani += 5;


            // console.log("---------------------------------")
            enCokPuanliSarki = puan_tablosu.sort((a, b) => b.sarki_puani - a.sarki_puani)[0];

            // puan_tablosu.forEach(item => {
            //     console.log(`%c${item.sarki.title} -> Güncel Puan: ${item.sarki_puani}`, 'color: green;', item.sarki.permalink_url);
            // });

            const track_id = puan_tablosu[0].sarki.id
            console.log(`%cSecilen Şarkı URL:${puan_tablosu[0].sarki.permalink_url}`, 'color : cyan;')

            const comments = await sendMessage(
                "get_comments",
                `${track_id}`,
                500//kac tane yorum gelecek
            )
            SuretakibiBaslat(comments);

            //yorum yoksa bitir hoca
            if (comments.length === 0) { console.log(`%Yorum bulunamadı,${gelen_sarkilar}`, 'color : purple;'); return; }

            // console.log(`%cYorumlar;`, 'color: cyan;')
            // console.log(comments);


        }
        else {
            console.log(`%cŞarkı bulunamadı!,${gelen_sarkilar}`, 'color : purple;')
            return;
        }
    }
    catch (error) {
        console.log("hata", error)
    }

}

function olustur(yorum) {
    const birinciLink = document.querySelector('[data-testid="now-playing-bar"]');
    const comment_block = document.querySelector('#comment-div-archer')

    if (birinciLink) {

        if (comment_block) {
            comment_block.remove();
        }
        const shadowHost = document.createElement('div');
        shadowHost.id = 'comment-div-archer';
        shadowHost.style.display = 'flex';
        shadowHost.style.verticalAlign = 'middle';
        shadowHost.style.textAlign = 'center'
        shadowHost.style.alignContent = 'center'
        shadowHost.style.justifyContent = 'center'
        birinciLink.insertAdjacentElement('beforebegin', shadowHost);

        // 4. Shadow DOM'u bağla
        const shadow = shadowHost.attachShadow({ mode: 'open' });

        const span = document.createElement('span');

        span.style.display = 'flex';
        span.style.flexDirection = 'row';
        span.style.alignItems = 'center';
        span.style.justifyContent = 'center';
        span.style.gap = '10px';
        span.style.width = '100%';

        const img = document.createElement('img')

        img.style.width = '32px';
        img.style.height = '32px';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';

        img.style.border = '2px solid #1ed760'

        img.src = yorum.avatar_url || '';

        const p = document.createElement('p');
        p.style.fontSize = '20px'

        p.textContent = yorum.body || '';

        const msdiv = document.createElement('div')
        const p2 = document.createElement('p')

        msdiv.style.backgroundColor = '#121212'
        msdiv.style.display = 'flex'
        msdiv.style.width = '40px'
        msdiv.style.height = '20px'
        msdiv.style.justifyContent = 'center'
        msdiv.style.alignItems = 'center';
        msdiv.style.borderRadius = '10%';

        const saniyeCinsi = saniyeCevirme(yorum.timestamp)
        p2.style.fontSize = '10px';

        if (saniyeCinsi === '-1:0-1') {
            saniyeCinsi = "0:00"
        }
        p2.textContent = saniyeCinsi

        span.appendChild(img)
        span.appendChild(p)
        msdiv.appendChild(p2)
        span.appendChild(msdiv)
        shadow.append(span)
    }

}

SarkitakibiBaslat()
