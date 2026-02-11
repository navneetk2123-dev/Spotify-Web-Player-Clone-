console.log("Spotify Clone JS Loaded");

let currentSong = new Audio();
let songs = [];
let currFolder = "";

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

async function getSongs(folder) {
    currFolder = folder;

    const res = await fetch(`${folder}/info.json`);
    const data = await res.json();

    songs = data.songs;

    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    songs.forEach(song => {
        songUL.innerHTML += `
        <li>
            <img class="invert" width="34" src="icons/music.svg">
            <div class="info">
                <div>${song}</div>
                <div>Artist</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img  src="icons/play playbar.svg">
            </div>
        </li>`;
    });

    Array.from(songUL.children).forEach(li => {
        li.addEventListener("click", () => {
            playMusic(li.querySelector(".info div").innerText.trim());
        });
    });

    return songs;
}


function playMusic(track, pause = false) {

    currentSong.src = `${currFolder}/${track}`;

    if (!pause) {
        currentSong.play();
        play.src = "icons/pause.svg";
    }

    document.querySelector(".songinfo").innerText = track;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

async function displayAlbums() {

    const folders = ["angry", "bright", "chill", "dark","funky","love","uplifting"];

    const cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    for (let folder of folders) {

        const res = await fetch(`songs/${folder}/info.json`);
        const data = await res.json();

        cardContainer.innerHTML += `
        <div class="card" data-folder="songs/${folder}">
            <img src="songs/${folder}/cover.jpg">
            <h2>${data.title}</h2>
            <p>${data.description}</p>
        </div>`;
    }

    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            songs = await getSongs(card.dataset.folder);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    await getSongs("songs/angry");
    playMusic(songs[0], true);
    await displayAlbums();
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "icons/pause.svg";
        } else {
            currentSong.pause();
            play.src = "icons/play.svg";
        }
    });
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });
    document.querySelector(".seekbar").addEventListener("click", e => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;

        currentSong.currentTime = currentSong.duration * percent;
        document.querySelector(".circle").style.left = percent * 100 + "%";
    });
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });
    document.querySelector(".range input").addEventListener("input", e => {
        currentSong.volume = e.target.value / 100;
    });


    document.querySelector(".volume icons").addEventListener("click", e => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            e.target.src = "icons/mute.svg";
        } else {
            currentSong.volume = 0.1;
            e.target.src = "icons/volume.svg";
        }
    });
}

main();
