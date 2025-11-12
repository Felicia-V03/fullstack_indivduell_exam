// ---------- FETCH FUNCTIONS ----------
// Hämta titlar från JSON
const fetchBooks = async () => {
    const response = await fetch('https://santosnr6.github.io/Data/books.json');
    if (!response.ok)
        throw new Error('Hittade inga böcker');
    const data = await response.json();
    return data.map(book => book.title);
};
// Hämta första träffen från Open Library
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
// ---------- DOM / UI FUNCTIONS ----------
const sectionSetup = () => {
    const sectionRefs = document.querySelectorAll('.section');
    sectionRefs.forEach(section => section.classList.add('d-none'));
};
const navSetup = () => {
    const navItemRefs = document.querySelectorAll('.nav-item');
    navItemRefs.forEach(navItem => {
        navItem.addEventListener('click', (e) => {
            console.log(e.target.dataset.id);
            toggleSectionDisplay(e.target.dataset.id);
        });
    });
};
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
const toggleFavorite = (workId, icon) => {
    const stored = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = stored.indexOf(workId);
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
    renderFavorites();
};
const searchBooks = async () => {
    const input = document.querySelector('#searchInput');
    const container = document.querySelector('#searchContainer');
    const query = input.value.trim();
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
const searchBtn = document.querySelector('#search-btn');
const searchInput = document.querySelector('#searchInput');
searchBtn.addEventListener('click', () => {
    toggleSectionDisplay('search'); // Visa söksektionen
    searchBooks();
});
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        toggleSectionDisplay('search'); // Visa söksektionen
        searchBooks();
    }
});
const showLoading = (container) => {
    container.innerHTML = `
    <div class="loading">
      <p>Laddar böcker.....</p>
    </div>
  `;
};
const renderBooks = async () => {
    const container = document.querySelector('#booksContainerAll');
    showLoading(container);
    try {
        // Hämta titlar och böcker parallellt
        const titles = await fetchBooks();
        const booksData = await Promise.all(titles.map(fetchBooksOpen));
        const books = booksData.filter((b) => b !== null);
        // Rendera direkt
        container.innerHTML = ''; // rensa loading
        if (books.length === 0) {
            container.innerHTML = '<p>Inga böcker hittades.</p>';
            return;
        }
        books.forEach(book => container.appendChild(createCard(book)));
    }
    catch {
        container.innerHTML = '<p>Kunde inte ladda böcker.</p>';
    }
};
const renderFavorites = async () => {
    // Hämta sparade favoriter (titlar)
    const favoriteTitles = JSON.parse(localStorage.getItem('favorites') || '[]');
    const container = document.querySelector('#favoritesContainer');
    // Visa loading
    container.innerHTML = `<div class="loading"><p>Laddar favoriter...</p></div>`;
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
// ---------- INIT APP ----------
const initApp = () => {
    sectionSetup();
    navSetup();
    toggleSectionDisplay('book');
};
document.addEventListener('DOMContentLoaded', initApp);
export {};
//# sourceMappingURL=index.js.map