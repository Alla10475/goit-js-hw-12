import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import axios from 'axios';

const modalLightboxGallery = new SimpleLightbox('.photo-container a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const refs = {
  searchForm: document.querySelector('.search-form'),
  photoListEl: document.querySelector('.photo-list'),
  loader: document.querySelector('.loader'),
  loaderLoadMore: document.querySelector('loader-load-more'),
  loadMoreBtn: document.querySelector('[data-action="load-more"]'),
};

// const queryParams = {
//   query: '',
//   page: 1,
//   maxPage: 0,
//   pageSize: 40,
// };

let page = 1;
let maxPage = 0;
let query = '';

const hiddenClass = 'is-hidden';

refs.searchForm.addEventListener('submit', handleSearch);

async function handleSearch(event) {
  event.preventDefault();

  refs.photoListEl.innerHTML = '';

  refs.loader.classList.remove(hiddenClass);

  page = 1;

  const form = event.currentTarget;
  query = form.elements.query.value.trim();

  if (!query) {
     
      refs.loader.classList.add(hiddenClass);

    iziToast.show({
      message: 'Please enter your request',
      position: 'topRight',
      color: 'yellow',
    });
    return;
    }
    
    // refs.loader.classList.add(hiddenClass);

  try {
    const { hits, totalHits } = await searchPhoto(query);

    maxPage = Math.ceil(totalHits / 40);

    markupPhoto(hits, refs.photoListEl);

    if (hits.length > 0 && hits.length !== totalHits) {
      refs.loadMoreBtn.classList.remove(hiddenClass);
      refs.loadMoreBtn.addEventListener('click', handleLoadMore);
    } else if (!hits.length) {
    refs.loadMoreBtn.classList.add(hiddenClass);

        iziToast.error({
          title: 'Error',
          titleSize: '30',
          messageSize: '25',
          message:
            'Sorry, there are no images matching your search query. Please try again!',
        });
    } else {
      refs.loadMoreBtn.classList.add(hiddenClass);
    }
  } catch (err) {
    console.log(err);
  } finally {
      refs.loader.classList.add(hiddenClass);
      form.reset();
  }
}

async function searchPhoto(value, page = 1) {
  const BASE_URL = 'https://pixabay.com/api';
  const API_KEY = '41870399-9b44301246ceb98c07efd626a';

  try {
    const response = await axios.get(`${BASE_URL}/`, {
      params: {
        key: API_KEY,
        q: value,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        per_page: 40,
        page,
      },
    });
    return response.data;
  } catch {
    iziToast.error({
      title: 'Error',
      titleSize: '30',
      messageSize: '25',
      message: 'Sorry! Try later! Server not working',
    });
    console.error(error.message);
  }
}

function markupPhoto(hits) {
  const markup = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<li class="gallery-item">
  <a class="gallery-link" href="${largeImageURL}">
    <img
      class="gallery-image"
      src="${webformatURL}"
      alt="${tags}"
    />
  </a><div class="gallery-descr">
   <p>Likes: <br><span>${likes}</span></p>
   <p>Views: <br><span>${views}</span></p>
   <p>Comment: <br><span>${comments}</span></p>
   <p>Downloads: <br><span>${downloads}</span></p></div>
</li>`
    )
    .join('');

  refs.photoListEl.insertAdjacentHTML('beforeend', markup);
  modalLightboxGallery.refresh();
}

async function handleLoadMore() {
  page += 1;
    refs.loaderLoadMore.classList.remove(hiddenClass);
    refs.loadMoreBtn.classList.add(hiddenClass);
    
    const getHeightImgCard = document
      .querySelector('.gallery-item')
      .getBoundingClientRect();

  try {
    const { hits } = await searchPhoto(query, page);

    markupPhoto(hits, refs.photoListEl);
  } catch (err) {
    console.log(err);
  } finally {
      window.scrollBy({
        top: getHeightImgCard.height * 2,
        left: 0,
        behavior: 'smooth',
      });
      refs.loaderLoadMore.classList.add(hiddenClass);
      refs.loadMoreBtn.classList.remove(hiddenClass);

    if (page === maxPage) {
      refs.loadMoreBtn.classList.add(hiddenClass);
        refs.loadMoreBtn.removeEventListener('click', handleLoadMore);
        iziToast.show({
          title: 'Hey',
          titleSize: '30',
          messageSize: '25',
          color: 'blue',
          position: 'topRight',
          message: "We're sorry, but you've reached the end of search results.",
        });
    }
  }
}


