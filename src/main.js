// Elementi DOM centrali
const btnCategoria = document.getElementById("btn-categoria");
const btnLoadMore = document.getElementById("btn-load-more");
const categoriaInput = document.getElementById("categoria");
const loader = document.getElementById("loader");
const risultati = document.getElementById("risultati");
const loadMoreContainer = document.getElementById("load-more-container");
const titleModal = document.getElementById("title-modal");
const modalDescription = document.getElementById("modale-description");

// Variabili globali per la paginazione
let currentCategory = "";
let currentPage = 1;
const resultsPerPage = 10;

// Event listener per la ricerca
btnCategoria.addEventListener("click", function () {
  const categoria = _.toLower(_.trim(categoriaInput.value));

  if (_.isEmpty(categoria)) {
    alert("Compila il campo categoria");
    return;
  }

  // Reset paginazione
  currentCategory = categoria;
  currentPage = 1;

  loader.style.display = "block";
  risultati.innerHTML = "";
  loadMoreContainer.style.display = "none";

  loadBooks(currentCategory, currentPage);
});

// Funzione per caricare i libri
function loadBooks(category, page) {
  const pathJson = `https://openlibrary.org/subjects/${category}.json?limit=${resultsPerPage}&offset=${
    (page - 1) * resultsPerPage
  }`;

  axios
    .get(pathJson)
    .then(function (response) {
      loader.style.display = "none";

      // Solo alla prima pagina, reset dei risultati
      if (page === 1) {
        risultati.innerHTML = "";
      }

      const data = response.data;

      if (_.isEmpty(data.works)) {
        if (page === 1) {
          risultati.innerHTML = `<p>Nessun risultato trovato per la categoria inserita.</p>`;
        } else {
          alert("Non ci sono più risultati disponibili");
        }
        loadMoreContainer.style.display = "none";
        return;
      }

      _.forEach(data.works, (libro) => {
        const titolo = libro.title;
        const autore = libro.authors
          ? _.map(libro.authors, "name").join(" - ")
          : "Autore non disponibile";
        const key = libro.key;

        risultati.innerHTML += `
          <div class="card" style="width: 18rem; margin-bottom: 20px;">
            <div class="card-body">
              <h5 class="card-title">${titolo}</h5>
              <p class="card-text">${autore}</p>
              <button class="btn btn-primary btn-dettaglio" data-key="${key}" data-titolo="${titolo}" data-bs-toggle="modal" data-bs-target="#desc-modal">
                Clicca per vedere dettaglio
              </button>
            </div>
          </div>
        `;
      });

      // Mostra il bottone "carica di più" solo se ha senso
      loadMoreContainer.style.display =
        data.works.length >= resultsPerPage ? "block" : "none";
    })
    .catch(function (error) {
      loader.style.display = "none";
      console.error("Errore durante la richiesta:", error);
    });
}

// Gestione del pulsante "Carica più risultati"
btnLoadMore.addEventListener("click", function () {
  currentPage++;
  loader.style.display = "block";
  loadBooks(currentCategory, currentPage);
});

// Gestione del dettaglio libro
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("btn-dettaglio")) {
    const button = event.target;
    const key = button.getAttribute("data-key");
    const titoloModale = button.getAttribute("data-titolo");

    titleModal.textContent = titoloModale;

    const path = `https://openlibrary.org${key}.json`;

    axios
      .get(path)
      .then(function (response) {
        const data = response.data;
        let description = "Descrizione non disponibile";

        if (!_.isEmpty(data.description)) {
          if (_.isString(data.description)) {
            description = data.description;
          } else if (_.isObject(data.description) && data.description.value) {
            description = data.description.value;
          }
        }

        modalDescription.textContent = description;
      })
      .catch(function (error) {
        modalDescription.textContent =
          "Errore nel caricamento della descrizione";
        console.error("Errore durante la richiesta:", error);
      });
  }
});
