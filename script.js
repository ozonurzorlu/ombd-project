const API_KEY = '2510dd49'; 

const mainTitle = document.getElementById('mainTitle'); 
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const suggestMovieBtn = document.getElementById('suggestMovieBtn');
const suggestSeriesBtn = document.getElementById('suggestSeriesBtn'); 
const movieResults = document.getElementById('movieResults');
const resultsTitle = document.getElementById('resultsTitle');

const toggleMovie = document.getElementById('toggleMovie');
const toggleSeries = document.getElementById('toggleSeries');

const categoryPills = document.querySelectorAll('.category-pill');
const favoritesList = document.getElementById('favoritesList');
const favCountSpan = document.getElementById('favCount');

const projectorOverlay = document.getElementById('projectorOverlay');
const countdownCircle = document.getElementById('countdownCircle');
const countNumber = document.getElementById('countNumber');
const winnerPresentation = document.getElementById('winnerPresentation');
const presentationPoster = document.getElementById('presentationPoster');
const projectorTitle = document.getElementById('projectorTitle'); 
const clapper = document.getElementById('clapper');

const fallbackPoster = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='350' style='background-color:%231e293b;'%3E%3Ctext y='50%25' x='50%25' dominant-baseline='middle' text-anchor='middle' font-size='30' fill='white' font-family='sans-serif'%3EAfis Yok%3C/text%3E%3C/svg%3E";

const movieDatabase = {
    'Populer': ['Interstellar', 'The Dark Knight', 'Inception', 'The Matrix', 'The Godfather', 'Pulp Fiction', 'Forrest Gump', 'Fight Club'],
    'Aksiyon': ['Mad Max: Fury Road', 'John Wick', 'Die Hard', 'Gladiator', 'The Terminator', 'Lethal Weapon', 'Speed', 'Predator'],
    'Komedi': ['The Hangover', 'Superbad', 'Dumb and Dumber', 'Tropic Thunder', 'Step Brothers', 'Mean Girls', '21 Jump Street', 'Hot Fuzz'],
    'BilimKurgu': ['Blade Runner 2049', 'Alien', 'Dune', 'The Martian', 'Arrival', 'Blade Runner', 'The Fifth Element', 'Gravity'],
    'Korku': ['The Shining', 'Get Out', 'Hereditary', 'A Nightmare on Elm Street', 'The Conjuring', 'The Exorcist', 'Halloween', 'Scream'],
    'Romantik': ['La La Land', 'The Notebook', 'Titanic', 'Pride and Prejudice', 'Before Sunrise', 'Notting Hill', 'Casablanca', 'Love Actually'],
    'Drama': ['The Shawshank Redemption', 'Forrest Gump', 'The Green Mile', 'Schindler\'s List', '12 Angry Men', 'Good Will Hunting', 'The Pursuit of Happyness', 'A Beautiful Mind'],
    'Gerilim': ['The Silence of the Lambs', 'Shutter Island', 'Prisoners', 'Zodiac', 'Gone Girl', 'Memento', 'The Sixth Sense', 'Mystic River'],
    'Animasyon': ['Spider-Man: Into the Spider-Verse', 'Toy Story', 'Up', 'WALL·E', 'Coco', 'Inside Out', 'Finding Nemo', 'The Lion King'],
    'Suc': ['The Godfather', 'Pulp Fiction', 'Goodfellas', 'The Departed', 'The Usual Suspects', 'City of God', 'Scarface', 'Heat']
};

const seriesDatabase = {
    'Populer': ['Breaking Bad', 'Game of Thrones', 'Chernobyl', 'Peaky Blinders', 'The Wire', 'The Sopranos', 'True Detective', 'Fargo'],
    'Aksiyon': ['24', 'Prison Break', 'Daredevil', 'The Boys', 'Reacher', 'Banshee', 'Strike Back', 'The Punisher'],
    'Komedi': ['Friends', 'The Office', 'Brooklyn Nine-Nine', 'Parks and Recreation', 'Seinfeld', 'How I Met Your Mother', 'The Big Bang Theory', 'Modern Family'],
    'BilimKurgu': ['Dark', 'Stranger Things', 'Westworld', 'Black Mirror', 'The Expanse', 'Fringe', 'Doctor Who', 'Firefly'],
    'Korku': ['The Walking Dead', 'American Horror Story', 'Bates Motel', 'Hannibal', 'Penny Dreadful', 'Midnight Mass', 'Castle Rock', 'The Strain'],
    'Romantik': ['Bridgerton', 'Outlander', 'Normal People', 'Love Alarm', 'Crash Landing on You', 'One Day', 'Heartstopper', 'Virgin River'],
    'Drama': ['Succession', 'Mad Men', 'The Crown', 'The Wire', 'The Sopranos', 'Better Call Saul', 'Six Feet Under', 'The West Wing'],
    'Gerilim': ['Mindhunter', 'True Detective', 'Fargo', 'Severance', 'Ozark', 'The Sinner', 'Mr. Robot', 'You'],
    'Animasyon': ['Arcane', 'Rick and Morty', 'BoJack Horseman', 'Avatar: The Last Airbender', 'Batman: The Animated Series', 'Invincible', 'Cyberpunk: Edgerunners', 'The Simpsons'],
    'Suc': ['Breaking Bad', 'Peaky Blinders', 'Narcos', 'The Sopranos', 'Boardwalk Empire', 'Snowfall', 'Sons of Anarchy', 'Gomorrah']
};

let activeCategory = 'Populer';
let activeCategoryName = 'POPÜLER';
let activeMediaType = 'movie'; 
let favorites = JSON.parse(localStorage.getItem('myMovieFavorites')) || [];

mainTitle.addEventListener('click', () => {
    localStorage.setItem('lastView', 'vitrin'); // Ana sayfaya dönüldüğünü kaydet
    const populerPill = document.querySelector('[data-category="Populer"]');
    if (populerPill) populerPill.click();
    searchInput.value = '';
    typeFilter.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

toggleMovie.addEventListener('change', () => {
    if(toggleMovie.checked) {
        activeMediaType = 'movie';
        localStorage.setItem('lastMediaType', 'movie'); // Medya tipini kaydet
        refreshGrid();
    }
});

toggleSeries.addEventListener('change', () => {
    if(toggleSeries.checked) {
        activeMediaType = 'series';
        localStorage.setItem('lastMediaType', 'series'); // Medya tipini kaydet
        refreshGrid();
    }
});

categoryPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
        categoryPills.forEach(p => p.classList.remove('active-pill'));
        e.target.classList.add('active-pill');

        activeCategory = e.target.getAttribute('data-category');
        activeCategoryName = e.target.getAttribute('data-name');
        
        // Kategori durumunu kaydet
        localStorage.setItem('lastView', 'vitrin');
        localStorage.setItem('lastCategory', activeCategory);
        localStorage.setItem('lastCategoryName', activeCategoryName);
        
        refreshGrid();
    });
});

let audioCtx;
function playProjectorSound() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const rumbleOsc = audioCtx.createOscillator();
    const rumbleGain = audioCtx.createGain();
    rumbleOsc.type = 'sine'; 
    rumbleOsc.frequency.setValueAtTime(40, audioCtx.currentTime); 
    
    rumbleGain.gain.setValueAtTime(0, audioCtx.currentTime);
    rumbleGain.gain.linearRampToValueAtTime(0.02, audioCtx.currentTime + 1); 
    rumbleGain.gain.linearRampToValueAtTime(0.02, audioCtx.currentTime + 2.5);
    rumbleGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 3.5); 

    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(audioCtx.destination);
    rumbleOsc.start();
    rumbleOsc.stop(audioCtx.currentTime + 3.5);

    for(let i = 0; i < 3; i++) {
        const beepOsc = audioCtx.createOscillator();
        const beepGain = audioCtx.createGain();
        const time = audioCtx.currentTime + i; 

        beepOsc.type = 'sine';
        beepOsc.frequency.setValueAtTime(800, time); 

        beepGain.gain.setValueAtTime(0, time);
        beepGain.gain.linearRampToValueAtTime(0.015, time + 0.01);
        beepGain.gain.linearRampToValueAtTime(0.015, time + 0.1);
        beepGain.gain.linearRampToValueAtTime(0, time + 0.15); 

        beepOsc.connect(beepGain);
        beepGain.connect(audioCtx.destination);

        beepOsc.start(time);
        beepOsc.stop(time + 0.15);
    }

    const revealTime = audioCtx.currentTime + 3;
    const magicNotes = [523.25, 659.25, 783.99, 1046.50]; 

    magicNotes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(freq, revealTime + (index * 0.08)); 

        gain.gain.setValueAtTime(0, revealTime + (index * 0.08));
        gain.gain.linearRampToValueAtTime(0.02, revealTime + (index * 0.08) + 0.05); 
        gain.gain.exponentialRampToValueAtTime(0.001, revealTime + (index * 0.08) + 2.5); 

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(revealTime + (index * 0.08));
        osc.stop(revealTime + (index * 0.08) + 2.5);
    });
}

function updateFavoritesUI() {
    favCountSpan.innerText = favorites.length;
    if(favorites.length === 0) {
        favoritesList.innerHTML = '<p class="text-white-50 text-center mt-5">Henüz favoriye eklenmiş bir yapım yok.</p>';
        return;
    }
    favoritesList.innerHTML = '';
    favorites.forEach(fav => {
        const item = document.createElement('div');
        item.className = 'fav-item d-flex justify-content-between';
        item.innerHTML = `
            <div class="d-flex align-items-center" style="cursor:pointer;" onclick="showSingleMovie('${fav.id}')" data-bs-dismiss="offcanvas">
                <img src="${fav.poster}" alt="poster">
                <div>
                    <h6 class="mb-0 text-white">${fav.title}</h6>
                    <small class="text-white-50">${fav.year}</small>
                </div>
            </div>
            <button class="btn btn-sm btn-outline-danger border-0" onclick="toggleFavorite('${fav.id}', '${fav.title.replace(/'/g, "\\'")}', '${fav.year}', '${fav.poster}')">❌</button>
        `;
        favoritesList.appendChild(item);
    });
}

window.toggleFavorite = function(id, title, year, poster) {
    const existsIndex = favorites.findIndex(f => f.id === id);
    if(existsIndex > -1) {
        favorites.splice(existsIndex, 1);
        Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Favorilerden Çıkarıldı', showConfirmButton: false, timer: 1500, background: '#1a1f2e', color: '#fff' });
    } else {
        favorites.push({ id, title, year, poster });
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Favorilere Eklendi! ⭐', showConfirmButton: false, timer: 1500, background: '#1a1f2e', color: '#fff' });
    }
    localStorage.setItem('myMovieFavorites', JSON.stringify(favorites));
    updateFavoritesUI();
    
    const btn = document.getElementById(`favBtn-${id}`);
    if(btn) {
        if(existsIndex > -1) {
            btn.innerHTML = '🤍 Favoriye Ekle'; btn.classList.replace('btn-warning', 'btn-outline-warning');
        } else {
            btn.innerHTML = '⭐ Favorilerden Çıkar'; btn.classList.replace('btn-outline-warning', 'btn-warning');
        }
    }
}

if (clapper) {
    let currentLeft = 95; 
    let isAnimating = false;

    document.addEventListener('mousemove', (e) => {
        if (isAnimating) return;
        const clapperRect = clapper.getBoundingClientRect();
        const clapperCenterX = clapperRect.left + clapperRect.width / 2;
        const clapperCenterY = clapperRect.top + clapperRect.height / 2;
        const distX = e.clientX - clapperCenterX;
        const distY = e.clientY - clapperCenterY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < 30) { 
            const moveAmount = 1.5; 
            if (distX > 0) currentLeft -= moveAmount; else currentLeft += moveAmount;
            clapper.style.left = currentLeft + '%';

            if (currentLeft <= 1 || currentLeft >= 99) triggerFall(currentLeft <= 1 ? 'left' : 'right');
        }
    });

    function triggerFall(side) {
        isAnimating = true; 
        clapper.classList.add('falling');
        setTimeout(() => {
            clapper.classList.remove('falling');
            clapper.classList.add('dropping-back'); 
            currentLeft = side === 'left' ? 95 : 5;
            clapper.style.left = currentLeft + '%';
            setTimeout(() => {
                clapper.classList.remove('dropping-back');
                setTimeout(() => isAnimating = false, 1000); 
            }, 50);
        }, 1000); 
    }
}

function sanitizeTurkishChars(text) {
    return text.replace(/İ/g, 'I').replace(/ı/g, 'i').replace(/Ş/g, 'S').replace(/ş/g, 's')
               .replace(/Ğ/g, 'G').replace(/ğ/g, 'g').replace(/Ç/g, 'C').replace(/ç/g, 'c')
               .replace(/Ö/g, 'O').replace(/ö/g, 'o').replace(/Ü/g, 'U').replace(/ü/g, 'u');
}

toggleMovie.addEventListener('change', () => {
    if(toggleMovie.checked) {
        activeMediaType = 'movie';
        refreshGrid();
    }
});

toggleSeries.addEventListener('change', () => {
    if(toggleSeries.checked) {
        activeMediaType = 'series';
        refreshGrid();
    }
});

categoryPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
        categoryPills.forEach(p => p.classList.remove('active-pill'));
        e.target.classList.add('active-pill');

        activeCategory = e.target.getAttribute('data-category');
        activeCategoryName = e.target.getAttribute('data-name');
        
        refreshGrid();
    });
});

function refreshGrid() {
    let titleText = "";
    let dataList = activeMediaType === 'movie' ? movieDatabase[activeCategory] : seriesDatabase[activeCategory];
    let typeName = activeMediaType === 'movie' ? 'FİLMLERİ' : 'DİZİLERİ';

    if (activeMediaType === 'movie') {
        suggestMovieBtn.classList.remove('d-none');
        suggestSeriesBtn.classList.add('d-none');
    } else {
        suggestMovieBtn.classList.add('d-none');
        suggestSeriesBtn.classList.remove('d-none');
    }

    if (activeCategory === 'Populer') {
        suggestMovieBtn.innerHTML = `🎬 BANA BİR FİLM ÖNER`;
        suggestSeriesBtn.innerHTML = `📺 BANA BİR DİZİ ÖNER`;
        titleText = activeMediaType === 'movie' ? "🌟 POPÜLER FİLMLER" : "🌟 POPÜLER DİZİLER";
    } else {
        suggestMovieBtn.innerHTML = `🎬 BANA ${activeCategoryName} FİLMİ ÖNER`;
        suggestSeriesBtn.innerHTML = `📺 BANA ${activeCategoryName} DİZİSİ ÖNER`;
        titleText = `${activeCategoryName} ${typeName}`;
    }

    loadMultipleMovies(dataList, titleText, activeMediaType);
}

document.addEventListener('DOMContentLoaded', () => {
    updateFavoritesUI();
    
    // LocalStorage'dan son durumu kontrol et
    const lastView = localStorage.getItem('lastView');
    
    if (lastView === 'search') {
        // Eğer kullanıcı en son arama yaptıysa, inputları doldur ve aramayı tetikle
        const savedTerm = localStorage.getItem('lastSearchTerm');
        const savedType = localStorage.getItem('lastSearchType');
        
        if (savedTerm) {
            searchInput.value = savedTerm;
            if (savedType) typeFilter.value = savedType;
            performSearch(savedTerm, savedType); 
        }
    } else {
        // Eğer en son vitrindeyse (veya siteye ilk kez giriliyorsa)
        activeCategory = localStorage.getItem('lastCategory') || 'Populer';
        activeCategoryName = localStorage.getItem('lastCategoryName') || 'POPÜLER';
        activeMediaType = localStorage.getItem('lastMediaType') || 'movie';
        
        // UI (Buton/Pill) Senkronizasyonu
        if (activeMediaType === 'series') {
            document.getElementById('toggleSeries').checked = true;
        } else {
            document.getElementById('toggleMovie').checked = true;
        }
        
        categoryPills.forEach(p => {
            p.classList.remove('active-pill');
            if(p.getAttribute('data-category') === activeCategory) {
                p.classList.add('active-pill');
            }
        });
        
        refreshGrid();
    }
});

async function loadMultipleMovies(movieTitles, sectionTitle, mediaType) {
    movieResults.innerHTML = '';
    resultsTitle.innerText = sectionTitle;

    const shuffledTitles = [...movieTitles].sort(() => 0.5 - Math.random());
    const titlesToShow = shuffledTitles.slice(0, 8); 

    for (const title of titlesToShow) {
        try {
            let res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&type=${mediaType}&apikey=${API_KEY}`);
            let data = await res.json();
            
            if (data.Response === "True") {
                displayMovieGridCard(data);
            }
        } catch (e) {
            console.error("API Bağlantı Hatası:", e);
        }
    }
}

function triggerSuggestion(type) {
    const isSeries = type === 'series';
    const activeList = isSeries ? seriesDatabase[activeCategory] : movieDatabase[activeCategory];
    const btn = isSeries ? suggestSeriesBtn : suggestMovieBtn;
    
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> ${isSeries ? 'DİZİ' : 'FİLM'} SARILIYOR...`;
    projectorTitle.innerText = isSeries ? `GÜNÜN ŞANSLI DİZİSİ` : `GÜNÜN ŞANSLI FİLMİ`;

    countdownCircle.style.display = 'flex';
    winnerPresentation.style.display = 'none';
    projectorOverlay.classList.add('projector-active');

    playProjectorSound();

    const randomTitle = activeList[Math.floor(Math.random() * activeList.length)];
    const fetchPromise = fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(randomTitle)}&type=${isSeries ? 'series' : 'movie'}&apikey=${API_KEY}`)
                            .then(response => response.json());

    let countdownVal = 3;
    countNumber.innerText = countdownVal;

    const timer = setInterval(() => {
        countdownVal--;
        if (countdownVal > 0) {
            countNumber.innerText = countdownVal;
        } else {
            clearInterval(timer);
            countdownCircle.style.display = 'none';

            const resetMovieText = activeCategory === 'Populer' ? '🎬 BANA BİR FİLM ÖNER' : `🎬 BANA ${activeCategoryName} FİLMİ ÖNER`;
            const resetSeriesText = activeCategory === 'Populer' ? '📺 BANA BİR DİZİ ÖNER' : `📺 BANA ${activeCategoryName} DİZİSİ ÖNER`;

            fetchPromise.then(movieData => {
                const finalPoster = (movieData.Response !== "False" && movieData.Poster !== "N/A") ? movieData.Poster : fallbackPoster;
                presentationPoster.onerror = function() { this.onerror = null; this.src = fallbackPoster; };
                presentationPoster.src = finalPoster;
                winnerPresentation.style.display = 'flex';

                setTimeout(() => {
                    projectorOverlay.classList.remove('projector-active');
                    
                    if (activeCategory === 'Populer') {
                        resultsTitle.innerText = isSeries ? "📺 SANA ÖZEL DİZİ SEÇİMİMİZ" : "🎬 SANA ÖZEL FİLM SEÇİMİMİZ";
                    } else {
                        resultsTitle.innerText = isSeries ? `📺 SANA ÖZEL ${activeCategoryName} DİZİ SEÇİMİMİZ` : `🎬 SANA ÖZEL ${activeCategoryName} FİLM SEÇİMİMİZ`;
                    }
                    
                    movieResults.innerHTML = ''; 
                    displayMovieDetailed(movieData); 
                    
                    btn.disabled = false;
                    btn.innerHTML = isSeries ? resetSeriesText : resetMovieText;
                }, 2500);
            }).catch(err => {
                projectorOverlay.classList.remove('projector-active');
                btn.disabled = false;
                btn.innerHTML = isSeries ? resetSeriesText : resetMovieText;
            });
        }
    }, 1000); 
}

suggestMovieBtn.addEventListener('click', () => triggerSuggestion('movie'));
suggestSeriesBtn.addEventListener('click', () => triggerSuggestion('series'));

async function performSearch(rawSearchTerm, type) {
    const title = sanitizeTurkishChars(rawSearchTerm);
    if (title === '') return;

    movieResults.innerHTML = '';
    resultsTitle.innerText = `🔍 "${rawSearchTerm}" İÇİN ARAMA SONUÇLARI`;

    try {
        const encodedTitle = encodeURIComponent(title);
        const typeParam = type !== "" ? `&type=${type}` : "";
        
        let response = await fetch(`https://www.omdbapi.com/?s=${encodedTitle}${typeParam}&apikey=${API_KEY}`);
        let searchData = await response.json();

        if (searchData.Response === "True") {
            const topResults = searchData.Search.slice(0, 8); 
            let detailedMovies = [];
            
            for(const item of topResults) {
                try {
                    let r = await fetch(`https://www.omdbapi.com/?i=${item.imdbID}&apikey=${API_KEY}`);
                    let d = await r.json();
                    if(d.Response === "True") detailedMovies.push(d);
                } catch(e) {}
            }

            detailedMovies.sort((a, b) => (parseInt(b.Year) || 0) - (parseInt(a.Year) || 0));

            detailedMovies.forEach(movie => {
                displayMovieGridCard(movie);
            });

        } else {
            let errorMsg = searchData.Error === "Movie not found!" ? `"${title}" ile eşleşen bir yapım bulamadık.` : `Sistem Yanıtı: ${searchData.Error}`;
            if(searchData.Error === "Too many results.") errorMsg = `"${title}" araması için çok fazla sonuç var. Lütfen biraz daha detaylı yazın.`;
            Swal.fire({ icon: 'error', title: 'Bulunamadı', text: errorMsg, background: '#1a1f2e', color: '#fff', confirmButtonColor: '#e5c07b' });
        }
    } catch (error) {
        Swal.fire({ icon: 'warning', title: 'Bağlantı Hatası', text: 'Sunucuya bağlanılamadı.', background: '#1a1f2e', color: '#fff', confirmButtonColor: '#e5c07b' });
    }
}

searchForm.addEventListener('submit', function(event) {
    event.preventDefault(); 
    const rawSearchTerm = searchInput.value.trim();
    const type = typeFilter.value;
    
    if (rawSearchTerm === '') return;

    // ARAMA YAPILDIĞINDA DURUMU LOCALSTORAGE'A KAYDET
    localStorage.setItem('lastView', 'search');
    localStorage.setItem('lastSearchTerm', rawSearchTerm);
    localStorage.setItem('lastSearchType', type);

    performSearch(rawSearchTerm, type);
});

async function showSingleMovie(id) {
    movieResults.innerHTML = '';
    resultsTitle.innerText = "🎬 YAPIM DETAYLARI";
    window.scrollTo({ top: document.getElementById('resultsTitle').offsetTop - 50, behavior: 'smooth' });
    try {
        let res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`);
        let data = await res.json();
        if(data.Response === "True") displayMovieDetailed(data);
    } catch(e) {}
}

function displayMovieGridCard(movie) {
    const posterSrc = movie.Poster !== "N/A" ? movie.Poster : fallbackPoster;
    const isFav = favorites.some(f => f.id === movie.imdbID);
    const card = `
        <div class="col-md-3 col-6 mb-4">
            <div class="card movie-card shadow border-0 h-100" style="cursor: pointer;" onclick="showSingleMovie('${movie.imdbID}')">
                <img src="${posterSrc}" class="card-img-top" style="height: 350px; object-fit: cover;" alt="${movie.Title}">
                <div class="card-body d-flex flex-column justify-content-between" style="background: rgba(10,10,10,0.9);">
                    <h6 class="text-white mb-2 text-truncate" title="${movie.Title}">${movie.Title}</h6>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-warning text-dark">${movie.imdbRating !== 'N/A' ? movie.imdbRating : '?'} ⭐</span>
                        <span class="text-white-50 small">${movie.Year}</span>
                    </div>
                    <button id="favBtn-${movie.imdbID}" class="btn btn-sm ${isFav ? 'btn-warning' : 'btn-outline-warning'} w-100 mt-2" 
                            onclick="event.stopPropagation(); toggleFavorite('${movie.imdbID}', '${movie.Title.replace(/'/g, "\\'")}', '${movie.Year}', '${posterSrc}')">
                        ${isFav ? '⭐ Favorilerden Çıkar' : '🤍 Favoriye Ekle'}
                    </button>
                </div>
            </div>
        </div>
    `;
    movieResults.insertAdjacentHTML('beforeend', card);
}

// ########## DÜZELTİLEN YER: RENKLERİN KONTRASTI ARTIRILDI ##########
function displayMovieDetailed(movie) {
    const posterSrc = movie.Poster !== "N/A" ? movie.Poster : fallbackPoster;
    let badgeColor = "bg-warning text-dark"; 
    let rating = parseFloat(movie.imdbRating);
    if (!isNaN(rating)) {
        if (rating >= 7.5) { badgeColor = "bg-success"; } else if (rating < 6.0) { badgeColor = "bg-danger"; } 
    }
    const isFav = favorites.some(f => f.id === movie.imdbID);
    const trailerLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.Title + ' trailer')}`;
    const movieCard = `
        <div class="col-md-10 mt-3">
            <div class="card movie-card shadow-lg border-0">
                <div class="row g-0">
                    <div class="col-md-4">
                        <img src="${posterSrc}" class="img-fluid rounded-start movie-poster" style="height: 100%; min-height: 500px;" alt="${movie.Title}" onerror="this.onerror=null; this.src='${fallbackPoster}';">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body p-4 d-flex flex-column h-100 justify-content-center">
                            <h2 class="card-title title-cinematic">${movie.Title} <span class="text-white-50 fs-4" style="text-shadow: none;">(${movie.Year})</span></h2>
                            <hr class="border-secondary my-3">
                            <div class="row mb-3">
                                <div class="col-6"><p class="card-text text-white"><strong class="text-warning">🎬 Tür:</strong> ${movie.Genre}</p></div>
                                <div class="col-6"><p class="card-text text-white"><strong class="text-warning">⭐ IMDB:</strong> <span class="badge ${badgeColor} fs-6">${movie.imdbRating}</span></p></div>
                            </div>
                            <p class="card-text text-white"><strong class="text-warning">🎥 Yönetmen:</strong> ${movie.Director}</p>
                            <p class="card-text text-white"><strong class="text-warning">🎭 Oyuncular:</strong> ${movie.Actors}</p>
                            <p class="card-text mt-3 text-white" style="font-size: 1.05rem; line-height: 1.6; opacity: 0.9;">${movie.Plot}</p>
                            <div class="d-flex gap-3 mt-4 pt-3 border-top border-secondary">
                                <a href="${trailerLink}" target="_blank" class="btn btn-danger px-4">▶ Fragman İzle</a>
                                <button id="favBtn-${movie.imdbID}" class="btn ${isFav ? 'btn-warning' : 'btn-outline-warning'} px-4" 
                                        onclick="toggleFavorite('${movie.imdbID}', '${movie.Title.replace(/'/g, "\\'")}', '${movie.Year}', '${posterSrc}')">
                                    ${isFav ? '⭐ Favorilerden Çıkar' : '🤍 Favoriye Ekle'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    movieResults.innerHTML = movieCard;
}
