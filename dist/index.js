// ---------- FETCH FUNCTIONS ----------
// Hämta titlar från JSON (Jesper API)
const fetchBooks = async () => {
    const response = await fetch('https://santosnr6.github.io/Data/books.json');
    if (!response.ok)
        throw new Error('Hittade inga böcker');
    const data = await response.json();
    return data.map(book => book.title);
};
// Hämta böckerna detailer från Open Library genom namn eller title
const fetchBooksOpen = async (title) => {
    try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${title}`);
        if (!response.ok)
            throw new Error('Kunde inte hämta data från Open Library');
        const data = await response.json();
        const oData = data.docs?.[0];
        if (!oData)
            return null;
        return {
            title: oData.title ?? 'Okänd titel',
            author: oData.author_name?.[0] ?? 'Okänd författare',
            workId: oData.key ?? null,
            imageId: oData.cover_i ?? null,
            publishYear: oData.first_publish_year ?? null,
            // Använda imageId med Open Library Covers för att får ut boken bild
            imageUrl: oData.cover_i
                ? `https://covers.openlibrary.org/b/id/${oData.cover_i}-M.jpg`
                : './res/none.png'
        };
    }
    catch (error) {
        console.error(error);
        return null;
    }
};
// ---------- SECTIONS FUNCTIONS ----------
//Börja med alla section blir d-none
const sectionSetup = () => {
    const sectionRefs = document.querySelectorAll('.section');
    sectionRefs.forEach(section => section.classList.add('d-none'));
};
//Hämta data-id från olika nav-item och skicka till toggleSectionDisplay
const navSetup = () => {
    const navItemRefs = document.querySelectorAll('.nav-item');
    //Kontrollera data-id och skicka med till toggleSectionDisplay
    navItemRefs.forEach(navItem => {
        navItem.addEventListener('click', (e) => {
            console.log(e.target.dataset.id);
            toggleSectionDisplay(e.target.dataset.id);
        });
    });
};
//Använda data-id från navSetup för att ta bort för visa upp vissa section och sätta d-none på vissa som ska inte visa upp
const toggleSectionDisplay = (section) => {
    const bookSection = document.querySelector('#bookSection');
    const searchSection = document.querySelector('#searchSection');
    const favoriteSection = document.querySelector('#favoriteSection');
    switch (section) {
        case 'book':
            bookSection.classList.remove('d-none');
            searchSection.classList.add('d-none');
            favoriteSection.classList.add('d-none');
            renderBooks();
            break;
        case 'search':
            bookSection.classList.add('d-none');
            searchSection.classList.remove('d-none');
            favoriteSection.classList.add('d-none');
            break;
        case 'favorite':
            bookSection.classList.add('d-none');
            searchSection.classList.add('d-none');
            favoriteSection.classList.remove('d-none');
            renderFavorites();
            break;
        default:
            console.log('Felaktig sektion');
    }
};
// ---------- UI FUNTIONS ----------
//Skapa bokkort med infomation från fetchBookData
const createCard = (book) => {
    const card = document.createElement('div');
    card.classList.add('book-card');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const isFavorite = book.workId && favorites.includes(book.workId);
    card.innerHTML = `
    <div class="book">
      <div class="cover">
        <img src="${book.imageUrl}" alt="${book.title} omslag">
      </div>
      <div class="book-down">
        <div class="book-inside"></div>
      </div>
    </div>
    <article class="book-detail">
      <section class="book-text">
        <h4 class="book-title">${book.title}</h4>
        <p class="book-author">${book.author}</p>
      </section>
      <i class="fa-bookmark ${isFavorite ? 'fa-solid active' : 'fa-regular'}"></i>
    </article>
  `;
    const bookmark = card.querySelector('.fa-bookmark');
    if (bookmark && book.workId) {
        bookmark.addEventListener('click', () => toggleFavorite(book.workId, bookmark));
    }
    return card;
};
//Favorit toggle funtion, spara key från boken i localstorge och kontrollera om boken är favorit eller inte
const toggleFavorite = (workId, icon) => {
    const stored = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = stored.indexOf(workId);
    //Kontrollera om boken är favorit eller inte, är den inte då skicka workId till localstorage men om den är det då ta den bort
    if (index === -1) {
        stored.push(workId);
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid', 'active');
    }
    else {
        stored.splice(index, 1);
        icon.classList.remove('fa-solid', 'active');
        icon.classList.add('fa-regular');
    }
    localStorage.setItem('favorites', JSON.stringify(stored));
};
//Sök funktion, skicka inputvalue med fetchBookOpen och får tillbaka svar och vissa upp boken
const searchBooks = async () => {
    const input = document.querySelector('#searchInput');
    const container = document.querySelector('#searchContainer');
    const query = input.value.trim();
    //Om sök input är tomt
    if (!query) {
        container.innerHTML = '<p>Skriv något att söka efter...</p>';
        return;
    }
    showLoading(container);
    try {
        const book = await fetchBooksOpen(query);
        container.innerHTML = ''; // rensa loading
        if (!book) {
            container.innerHTML = `<p>Ingen bok hittades för "${query}".</p>`;
            return;
        }
        container.appendChild(createCard(book));
    }
    catch {
        container.innerHTML = `<p>Något gick fel vid sökningen.</p>`;
    }
};
//Hämta sök knapp och input
const searchBtn = document.querySelector('#search-btn');
const searchInput = document.querySelector('#searchInput');
//Skicka inputvalue med knapp
searchBtn.addEventListener('click', () => {
    toggleSectionDisplay('search'); // Visa söksektionen
    searchBooks();
});
//Skicka inputvalue med enter
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        toggleSectionDisplay('search'); // Visa söksektionen
        searchBooks();
    }
});
// ---------- RENDERA AND LOADING ----------
//Visa upp loading text när böckerna håller på att laddar
const showLoading = (container) => {
    container.innerHTML = `
    <div class="loading">
      <p>Laddar böcker.....</p>
    </div>
  `;
};
//Rendera ut alla böckerna
const renderBooks = async () => {
    const container = document.querySelector('#booksContainerAll');
    // Visa loading
    showLoading(container);
    try {
        // Hämta titlar från fetchBooks och skicka och hämta böcker detail med fetchBookOpen
        const titles = await fetchBooks();
        const booksData = await Promise.all(titles.map(fetchBooksOpen));
        const books = booksData.filter((b) => b !== null);
        container.innerHTML = ''; // rensa loading
        books.forEach(book => container.appendChild(createCard(book)));
    }
    catch {
        container.innerHTML = '<p>Kunde inte ladda böcker.</p>';
    }
};
//Rendera ut alla favoriterna böckerna
const renderFavorites = async () => {
    // Hämta sparade favoriter
    const favoriteTitles = JSON.parse(localStorage.getItem('favorites') || '[]');
    const container = document.querySelector('#favoritesContainer');
    // Visa loading
    showLoading(container);
    //Om det finns ingen favorit
    if (favoriteTitles.length === 0) {
        container.innerHTML = '';
        const p = document.createElement('p');
        p.classList.add('empty-message');
        p.textContent = 'Du har inga favoriter sparade ännu';
        container.appendChild(p);
        return;
    }
    try {
        // Hämta alla favoriter parallellt via titlar
        const bookPromises = favoriteTitles.map(title => fetchBooksOpen(title));
        const booksData = await Promise.all(bookPromises);
        const books = booksData.filter((b) => b !== null);
        // Rendera böcker
        container.innerHTML = '';
        books.forEach(book => container.appendChild(createCard(book)));
    }
    catch {
        container.innerHTML = '<p>Kunde inte ladda favoriter.</p>';
    }
};
// ---------- STARTA ----------
sectionSetup();
navSetup();
//Set att det start med book så att det visa upp alla böckerna från början
toggleSectionDisplay('book');
export {};
//# sourceMappingURL=index.js.map