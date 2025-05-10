document.getElementById("btn-categoria").addEventListener("click", function () {
  const categoriaInput = document.getElementById("categoria");
  const categoria = _.toLower(_.trim(categoriaInput.value));

  if (_.isEmpty(categoria)) {
    alert("Compila il campo categoria");
    return;
  }

  document.getElementById("loader").style.display = "block";
  document.getElementById("risultati").innerHTML = "";

  const pathJson = `https://openlibrary.org/subjects/${categoria}.json`;

  axios
    .get(pathJson)
    .then(function (response) {
      document.getElementById("loader").style.display = "none";
      const risultati = document.getElementById("risultati");
      risultati.innerHTML = "";

      const data = response.data;

      if (_.isEmpty(data.works)) {
        risultati.innerHTML = `<p>Nessun risultato trovato per la categoria inserita.</p>`;
        return;
      }

      _.forEach(data.works, (libro) => {
        const titolo = libro.title;
        const autore = libro.authors
          ? _.map(libro.authors, "name").join(" - ")
          : "Autore non disponibile";
        const key = libro.key;

        risultati.innerHTML += `
          <div class="card" style="width: 18rem;">
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
    })
    .catch(function (error) {
      document.getElementById("loader").style.display = "none";
      console.error("Errore durante la richiesta:", error);
    });
});

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("btn-dettaglio")) {
    const button = event.target;
    const key = button.getAttribute("data-key");
    const titoloModale = button.getAttribute("data-titolo");

    document.getElementById("title-modal").textContent = titoloModale;

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

        document.getElementById("modale-description").textContent = description;
      })
      .catch(function (error) {
        document.getElementById("modale-description").textContent =
          "Errore nel caricamento della descrizione";
        console.error("Errore durante la richiesta:", error);
      });
  }
});
