const API_KEY = 'dbc23af8'; 

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const suggestButton = document.getElementById('suggestButton');
const movieResults = document.getElementById('movieResults');
const loadingSpinner = document.getElementById('loadingSpinner');

const projectorOverlay = document.getElementById('projectorOverlay');
const countdownCircle = document.getElementById('countdownCircle');
const countNumber = document.getElementById('countNumber');
const winnerPresentation = document.getElementById('winnerPresentation');
const presentationPoster = document.getElementById('presentationPoster');

const topMovies = [
    "The Godfather", "Eternal Sunshine Of The Spotless Mind", "Pulp Fiction", "Fight Club", "Interstellar", 
    "The Matrix", "Goodfellas", "Inception", "Parasite", "Inside Out", "Cast Away",
    "The Green Mile", "Spirited Away", "Whiplash", "The Departed",
    "Gladiator", "The Prestige", "The Lord of the Rings"
];

const fallbackPoster = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='350' style='background-color:%231e293b;'%3E%3Ctext y='50%25' x='50%25' dominant-baseline='middle' text-anchor='middle' font-size='30' fill='white' font-family='sans-serif'%3EAfis Yok%3C/text%3E%3C/svg%3E";

// ########## TÜRKÇE KARAKTER DÜZELTİCİ ##########
function sanitizeTurkishChars(text) {
    return text.replace(/İ/g, 'I').replace(/ı/g, 'i')
               .replace(/Ş/g, 'S').replace(/ş/g, 's')
               .replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
               .replace(/Ç/g, 'C').replace(/ç/g, 'c')
               .replace(/Ö/g, 'O').replace(/ö/g, 'o')
               .replace(/Ü/g, 'U').replace(/ü/g, 'u');
}

document.addEventListener('DOMContentLoaded', () => {
    const lastSearch = localStorage.getItem('lastMovieSearch');
    const lastType = localStorage.getItem('lastTypeFilter');
    if (lastSearch) {
        searchInput.value = lastSearch;
        if (lastType) typeFilter.value = lastType;
        fetchMovieData(sanitizeTurkishChars(lastSearch), lastType, false); 
    }
});

searchForm.addEventListener('submit', function(event) {
    event.preventDefault(); 
    const rawSearchTerm = searchInput.value.trim();
    const cleanSearchTerm = sanitizeTurkishChars(rawSearchTerm);
    const type = typeFilter.value;
    
    if (cleanSearchTerm !== '') {
        fetchMovieData(cleanSearchTerm, type, true); 
    }
});

// ########## BANA FİLM ÖNER BUTONU ##########
suggestButton.addEventListener('click', () => {
    movieResults.innerHTML = '';
    suggestButton.disabled = true;
    suggestButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> FİLM SARILIYOR...';

    countdownCircle.style.display = 'flex';
    winnerPresentation.style.display = 'none';
    projectorOverlay.classList.add('projector-active');

    const randomTitle = topMovies[Math.floor(Math.random() * topMovies.length)];
    const fetchPromise = fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(randomTitle)}&apikey=${API_KEY}`)
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

            fetchPromise.then(movieData => {
                const finalPoster = (movieData.Response !== "False" && movieData.Poster !== "N/A") 
                                    ? movieData.Poster : fallbackPoster;
                presentationPoster.onerror = function() { this.onerror = null; this.src = fallbackPoster; };
                presentationPoster.src = finalPoster;
                winnerPresentation.style.display = 'flex';

                setTimeout(() => {
                    projectorOverlay.classList.remove('projector-active');
                    displayMovie(movieData); 
                    suggestButton.disabled = false;
                    suggestButton.innerHTML = '🎬 BANA BİR FİLM ÖNER';
                }, 2500);

            }).catch(err => {
                console.error(err);
                projectorOverlay.classList.remove('projector-active');
                suggestButton.disabled = false;
                suggestButton.innerHTML = '🎬 BANA BİR FİLM ÖNER';
            });
        }
    }, 1000); 
});

// ########## KUSURSUZ (BULLETPROOF) ARAMA MANTIĞI ##########
async function fetchMovieData(title, type, updateLocalStorage) {
    movieResults.innerHTML = '';
    loadingSpinner.classList.remove('d-none');

    try {
        const encodedTitle = encodeURIComponent(title);
        
        // ZEKİCE DOKUNUŞ: Type parametresi boşsa OMDB API sapıtabiliyor. Boşsa URL'ye hiç eklemiyoruz!
        const typeParam = type !== "" ? `&type=${type}` : "";
        
        // 1. Aşama: Tam İsim Araması
        let response = await fetch(`https://www.omdbapi.com/?t=${encodedTitle}${typeParam}&apikey=${API_KEY}`);
        let data = await response.json();

        // 2. Aşama: Eğer tam uymuyorsa (Örn: "incep" yazıldıysa) Kısmi Arama yap!
        if (data.Response === "False") {
            let searchResponse = await fetch(`https://www.omdbapi.com/?s=${encodedTitle}${typeParam}&apikey=${API_KEY}`);
            let searchData = await searchResponse.json();

            // Eğer "Too many results" değil de gerçekten filmler bulduysa, İLK sıradakini al
            if (searchData.Response === "True" && searchData.Search && searchData.Search.length > 0) {
                const firstMatchId = searchData.Search[0].imdbID;
                const detailResponse = await fetch(`https://www.omdbapi.com/?i=${firstMatchId}&apikey=${API_KEY}`);
                data = await detailResponse.json();
            } else {
                // Kısmi arama da patladıysa (Too many results vb.), hatayı yakala
                data = searchData; 
            }
        }

        loadingSpinner.classList.add('d-none');

        if (data.Response === "False") {
            // SİNYAL (Hata Yakalama): API'nin tam olarak neden kızdığını ekrana yazdırıyoruz (Gerçek profesyonellik)
            let errorMsg = data.Error === "Movie not found!" 
                ? `"${title}" ile eşleşen bir film bulamadık.` 
                : `Sistem Yanıtı: ${data.Error}`;
            
            // OMDB çok kısa kelimelerde bu hatayı verir
            if(data.Error === "Too many results.") {
                errorMsg = `"${title}" araması için çok fazla sonuç var. Lütfen biraz daha detaylı yazın.`;
            }

            Swal.fire({
                icon: 'error', title: 'Bulunamadı', text: errorMsg,
                background: '#1a1f2e', color: '#fff', confirmButtonColor: '#e5c07b'
            });
        } else {
            // Sadece %100 başarılı sonuçlar hafızaya kaydedilsin
            if(updateLocalStorage) {
                localStorage.setItem('lastMovieSearch', searchInput.value.trim());
                localStorage.setItem('lastTypeFilter', type);
            }
            displayMovie(data);
        }
    } catch (error) {
        loadingSpinner.classList.add('d-none');
        Swal.fire({
            icon: 'warning', title: 'Bağlantı Hatası', text: 'Sunucuya bağlanılamadı.',
            background: '#1a1f2e', color: '#fff', confirmButtonColor: '#e5c07b'
        });
        console.error("API Hatası:", error);
    }
}

function displayMovie(movie) {
    const posterSrc = movie.Poster !== "N/A" ? movie.Poster : fallbackPoster;
    let badgeColor = "bg-warning text-dark"; 
    let rating = parseFloat(movie.imdbRating);
    if (!isNaN(rating)) {
        if (rating >= 7.5) { badgeColor = "bg-success"; } 
        else if (rating < 6.0) { badgeColor = "bg-danger"; } 
    }

    const movieCard = `
        <div class="col-md-8 col-lg-6 mt-3">
            <div class="card movie-card shadow-lg border-0">
                <div class="row g-0">
                    <div class="col-md-5">
                        <img src="${posterSrc}" class="img-fluid rounded-start movie-poster" alt="${movie.Title}" onerror="this.onerror=null; this.src='${fallbackPoster}';">
                    </div>
                    <div class="col-md-7">
                        <div class="card-body">
                            <h3 class="card-title title-cinematic" style="font-size: 1.8rem;">${movie.Title} <span class="text-white-50 fs-5" style="text-shadow: none;">(${movie.Year})</span></h3>
                            <hr class="border-secondary">
                            <p class="card-text"><strong>🎬 Tür:</strong> ${movie.Genre}</p>
                            <p class="card-text"><strong>🎥 Yönetmen:</strong> ${movie.Director}</p>
                            <p class="card-text"><strong>⭐ IMDB:</strong> <span class="badge ${badgeColor}">${movie.imdbRating}</span></p>
                            <p class="card-text mt-3 text-white-50" style="font-size: 0.95rem;">${movie.Plot}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    movieResults.innerHTML = movieCard;
}
