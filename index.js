const autoCompleteConfig = {
    renderOption(movie){
        const imgSRC = movie.Poster === 'N/A' ? '': movie.Poster;
        return `<img src="${imgSRC}" />
        ${movie.Title} (${movie.Year})
    `;
    },
    inputValue(movie){
        return movie.Title;
    },
    async fetchData (searchTerm) {
        const response = await axios.get("http://www.omdbapi.com", {
        params: {
            apikey: 'e12b355c',
            s: searchTerm
        }
    });
        if (response.data.Error){
        return [];
    }
        return response.data.Search;
    }
}
createAutocomplete({
    ... autoCompleteConfig,
    root: document.querySelector('#left-autocomplete'),
    onOptionSelect(movie){
        document.querySelector(".tutorial").classList.add("is-hidden");
        onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
    },
});

createAutocomplete({
    ... autoCompleteConfig,
    root: document.querySelector('#right-autocomplete'),
    onOptionSelect(movie){
        document.querySelector(".tutorial").classList.add("is-hidden");
        onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
    },
});

let leftMovie;
let rightMovie;
const onMovieSelect = async (movie, summaryTarget, side) => {
    const response = await axios.get("http://www.omdbapi.com", {
        params: {
            apikey: 'e12b355c',
            i: movie.imdbID
        }
    });

    summaryTarget.innerHTML = MovieTemplate(response.data);
    if (side === 'left'){
        leftMovie = response.data;
    } else {
        rightMovie = response.data;
    }

    if (leftMovie && rightMovie){
        runComparison();
    }
    // if (response.data.Error){
    //     return [];
    // }
    // return response.data.Search;
};
const runComparison = () => {
    const leftSideStats = document.querySelectorAll("#left-summary .notification");
    const rideSideStats = document.querySelectorAll("#right-summary .notification");
    leftSideStats.forEach((leftStat, index) => {
        const rightStat = rideSideStats[index];
        const leftSideValue = parseInt(leftStat.dataset.value);
        const rightSideValue = parseInt(rightStat.dataset.value);

        if (rightSideValue > leftSideValue){
            leftStat.classList.remove("is-primary");
            leftStat.classList.add("is-warning");
        } else {
            rightStat.classList.remove("is-primary");
            rightStat.classList.add("is-warning");
        }
    });
};

const MovieTemplate = (movieDetails) => {
    const awards = movieDetails.Awards.split(' ').reduce((initial, word) => {
        const value = parseInt(word);  
        if (isNaN(value)){
            return initial;
        } else {
            return initial + value;
        }
    
    }, 0);

    const dollars= parseInt(movieDetails.BoxOffice.replace(/\$/g, '').replace(/,/g, ''));
    const metaScore= parseInt(movieDetails.Metascore);
    const imdbRating = parseFloat(movieDetails.imdbRating);
    const imdbVotes = parseInt(movieDetails.imdbVotes.replace(/,/g, ''));
    return `
    <article class="media">
        <figure class="media-left">
            <p class="image">
                <img src="${movieDetails.Poster}"></img>
            </p>
        </figure>
        <div class="media-content">
            <div class="content">
                <h1>${movieDetails.Title}</h1>
                <h4>${movieDetails.Genre}</h4>
                <p>${movieDetails.Plot}</p>
            </div>
        </div>
    </article>
    <article data-value = ${awards} class="notification is-primary">
        <p class="title">${movieDetails.Awards}</p>
        <p class ="subtitle">Awards</p>
        </article>
    <article data-value = ${dollars} class="notification is-primary">
        <p class="title">${movieDetails.BoxOffice}</p>
        <p class ="subtitle">Box Office</p>
        </article>
    <article data-value = ${metaScore} class="notification is-primary">
        <p class="title">${movieDetails.Metascore}</p>
        <p class ="subtitle">Metascore</p>
        </article>
    <article data-value = ${imdbRating} class="notification is-primary">
        <p class="title">${movieDetails.imdbRating}</p>
        <p class ="subtitle">IMDB Rating</p>
        </article>
    <article data-value = ${imdbVotes} class="notification is-primary">
        <p class="title">${movieDetails.imdbVotes}</p>
        <p class ="subtitle">IMDB Votes</p>
    </article>
`
}