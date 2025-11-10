import type { BookWithData, BookBasic, BookOpen } from './interfaces/index.ts';

// 1. Hämta böcker från JSON
const fetchBooks = async (): Promise<string[]> => {
  const response = await fetch('https://santosnr6.github.io/Data/books.json');
  if (!response.ok) throw new Error('Hittade inga böcker');
  const data = await response.json();

  // returnera bara titlar
  const titles = data.map((book: BookBasic) => book.title);
  return titles;
};

// 2. Hämta första träffen från Open Library
const fetchOpenLibraryData = async (title: string): Promise<BookOpen | null> => {
  const response = await fetch(`https://openlibrary.org/search.json?q=${title}`);
  if (!response.ok) throw new Error('Kunde inte hämta data från Open Library');

  const data = await response.json();
  const oData = data.docs?.[0];
  if (!oData) return null;

  const result: BookOpen = {
    title: oData.title ?? 'Okänd titel',
    author: oData.author_name?.[0] ?? 'Okänd författare',
    imageId: oData.cover_i ?? null,
    publishYear: oData.first_publish_year ?? null,
  };

  return result;
};

// 3. Kombinera lokal bokdata med Open Library-info
const fetchBooksWithCovers = async (): Promise<BookWithData[]> => {
  const titles = await fetchBooks();

  const results = await Promise.all(
    titles.map(async (title) => {
      const olData = await fetchOpenLibraryData(title);

      const imageUrl = olData?.imageId
        ? `https://covers.openlibrary.org/b/id/${olData.imageId}-M.jpg`
        : './res/none.png';

      return {
        title,
        author: olData?.author ?? 'Okänd författare',
        publishYear: olData?.publishYear ?? null,
        imageUrl
      };
    })
  );

  console.log(results);
  return results;
};

// 4. Skapa ett bokkort-element
const createCard = (book: BookWithData): HTMLElement => {
  const card = document.createElement('div');
  card.classList.add('book-card');

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
        <p class="book-author">${book.author ?? ''}</p>
      </section>
      <i class="fa-regular fa-bookmark"></i>
    </article>
  `;

  return card;
};

// 5. Rendera alla böcker i DOM
const renderBooks = (books: BookWithData[]) => {
  const container = document.querySelector('.books-container') as HTMLElement;
  if (!container) return;

  container.innerHTML = ''; // rensa tidigare innehåll
  books.forEach((book) => {
    container.appendChild(createCard(book));
  });
};

// 6. Kör allt
(async () => {
  try {
    const booksWithCovers = await fetchBooksWithCovers();
    renderBooks(booksWithCovers);
    console.log(booksWithCovers);
  } catch (err) {
    console.error('Fel vid hämtning eller rendering av böcker:', err);
  }
})();
