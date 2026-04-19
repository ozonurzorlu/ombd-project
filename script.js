// OMDB API Anahtarını buraya yazmalısın
const API_KEY = 'dbc23af8'; 

// HTML'deki elementleri (kutuları, butonları) JavaScript'e tanıtıyoruz
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const movieResults = document.getElementById('movieResults');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');

// 1. Sayfa ilk açıldığında çalışacak kod (LocalStorage Kontrolü)
// Eğer kullanıcı daha önce bir film aratmışsa, sayfayı yenilediğinde o film tekrar gelsin (Bonus Puan!)
document.addEventListener('DOMContentLoaded', () => {
    const lastSearch = localStorage.getItem('lastMovieSearch');
    const lastType = localStorage.getItem('lastTypeFilter');

    if (lastSearch) {
        searchInput.value = lastSearch;
        if (lastType) typeFilter.value = lastType;
        // Hafızadaki kelimeyle otomatik arama yap
        fetchMovieData(lastSearch, lastType); 
    }
});

// 2. Kullanıcı "Ara" butonuna bastığında çalışacak kod
searchForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Sayfanın yenilenmesini engeller (SPA kuralı)

    const searchTerm = searchInput.value.trim();
    const type = typeFilter.value;

    if (searchTerm !== '') {
        // Son aramayı tarayıcı hafızasına (LocalStorage) kaydet
        localStorage.setItem('lastMovieSearch', searchTerm);
        localStorage.setItem('lastTypeFilter', type);
        
        // Veri çekme fonksiyonunu başlat
        fetchMovieData(searchTerm, type);
    }
});

// 3. OMDB API'den Veri Çekme Fonksiyonu
// async/await kullanarak modern ve temiz bir yapı kurduk
async function fetchMovieData(title, type) {
    // Önce ekranı temizle ve yükleniyor animasyonunu göster
    movieResults.innerHTML = '';
    errorMessage.classList.add('d-none');
    loadingSpinner.classList.remove('d-none');

    try {
        // OMDB'ye isteği atıyoruz (t= parametresi ile tam isim araması yapıyoruz ki yönetmen/tür detayları gelsin)
        const response = await fetch(`https://www.omdbapi.com/?t=${title}&type=${type}&apikey=${API_KEY}`);
        const data = await response.json();

        // Yükleniyor animasyonunu gizle
        loadingSpinner.classList.add('d-none');

        // Eğer API "Bulamadım" (False) derse hata göster
        if (data.Response === "False") {
            showError("Aradığınız film bulunamadı. Lütfen başka bir isim deneyin.");
        } else {
            // Film bulunduysa ekrana bas
            displayMovie(data);
        }

    } catch (error) {
        // İnternet kopması gibi beklenmedik hataları yakala
        loadingSpinner.classList.add('d-none');
        showError("Sunucuya bağlanırken bir hata oluştu. Lütfen bağlantınızı kontrol edin.");
        console.error("API Hatası:", error);
    }
}

// 4. Gelen Veriyi Ekrana (HTML'e) Çizdirme Fonksiyonu
function displayMovie(movie) {
    // Eğer afiş yoksa (N/A dönüyorsa), varsayılan gri bir resim gösterelim ki tasarım bozulmasın
    const posterSrc = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=Afis+Yok";

    // Filmin kart tasarımını oluşturuyoruz
    const movieCard = `
        <div class="col-md-8 col-lg-6 mt-3">
            <div class="card movie-card shadow-sm border-0">
                <div class="row g-0">
                    <div class="col-md-5">
                        <img src="${posterSrc}" class="img-fluid rounded-start movie-poster" alt="${movie.Title}">
                    </div>
                    <div class="col-md-7">
                        <div class="card-body">
                            <h3 class="card-title fw-bold">${movie.Title} <span class="text-muted fs-5">(${movie.Year})</span></h3>
                            <hr>
                            <p class="card-text"><strong>🎬 Tür:</strong> ${movie.Genre}</p>
                            <p class="card-text"><strong>🎥 Yönetmen:</strong> ${movie.Director}</p>
                            <p class="card-text"><strong>⭐ IMDB Puanı:</strong> <span class="badge bg-warning text-dark">${movie.imdbRating}</span></p>
                            <p class="card-text mt-3 text-secondary" style="font-size: 0.95rem;">${movie.Plot}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Oluşturduğumuz kartı HTML'deki boşluğa ekliyoruz
    movieResults.innerHTML = movieCard;
}

// 5. Hata Mesajı Gösterme Fonksiyonu
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('d-none'); // d-none sınıfını silerek mesajı görünür yap
}