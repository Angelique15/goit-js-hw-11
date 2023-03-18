import axios from "axios";
import Notiflix from "notiflix";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const API_KEY = "34274583-358fbb18fdafc2f53cb7ada51";
const gallery = document.querySelector(".gallery");
const searchForm = document.querySelector(".search-form");
const loadMoreBtn = document.querySelector(".load-more");

let searchQuery = "";
let currentPage = 1;
let totalHits = 0;
let isFetching = false;

let lightbox;

const handleSearch = async (e) => {
    e.preventDefault();
    searchQuery = e.target.searchQuery.value.trim();
    currentPage = 1;
    totalHits = 0;
    gallery.innerHTML = "";
    if (searchQuery !== "") {
        fetchImages();
    }
};

searchForm.addEventListener("submit", handleSearch);


const fetchImages = async () => {
    if (isFetching) return;
    isFetching = true;
    try {
        const response = await axios.get(
            `https://pixabay.com/api/?key=${API_KEY}&q=${searchQuery}&image_type=photo&page=${currentPage}&per_page=40`
        );
        const data = response.data;
        totalHits = data.totalHits;
        if (totalHits === 0) {
            Notiflix.Notify.warning(
                "No results found!, Please try again."
            );
            return;
        }
        const images = data.hits.map((hit) => {
            const imageCard = document.createElement("div");
            imageCard.classList.add("photo-card");
            imageCard.innerHTML = `
        <a href="${hit.largeImageURL}">
          <img src="${hit.webformatURL}" alt="${hit.tags}">
        </a>
        <div class="info">
          <p class="info-item"><b>Likes</b> ${hit.likes}</p>
          <p class="info-item"><b>Views</b> ${hit.views}</p>
          <p class="info-item"><b>Comments</b> ${hit.comments}</p>
          <p class="info-item"><b>Downloads</b> ${hit.downloads}</p>
        </div>
      `;
            return imageCard;
        });
        gallery.append(...images);
        if (!lightbox) {
            lightbox = new SimpleLightbox(".gallery a", {
                captionsData: "alt",
                captionDelay: 250,
            });
        } else {
            lightbox.refresh();
        }
        if (totalHits > gallery.children.length) {
            if (loadMoreBtn) {
                loadMoreBtn.style.display = "block";
            }
        } else {
            if (loadMoreBtn) {
                loadMoreBtn.style.display = "none";
                Notiflix.Notify.warning(
                    "We're sorry, but you've reached the end of search results."
                );
            }
        }
        currentPage++;
        Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    } catch (error) {
        console.error(error);
        Notiflix.Notify.failure("Failed to fetch images!");
    } finally {
        isFetching = false;
    }
};

const handleLoadMore = () => {
    fetchImages();
};

if (loadMoreBtn) {
    loadMoreBtn.style.display = "none";
    loadMoreBtn.addEventListener("click", handleLoadMore);
}

searchForm.addEventListener("submit", handleSearch);
const handleScroll = () => {
    const scrollPosition = window.scrollY;
    const pageBottom = document.documentElement.offsetHeight - window.innerHeight;
    if (scrollPosition > pageBottom - 100 && !isFetching && totalHits > gallery.children.length) {
        fetchImages();
    }
};

window.addEventListener("scroll", handleScroll);
