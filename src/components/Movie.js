import React, { useEffect, useState } from 'react'

function Movie() {
    
    const [movieList, setMovieList] = useState([])

    const getMovie = () => {
        //Fetching the api and get Movies
        fetch("https://api.themoviedb.org/3/discover/movie?api_key=e6f982ddd401b7a5a7a7184e6df5f48d")
        .then(res => res.json())
        .then(json => setMovieList(json.results))
    }

    useEffect(()=> {
        getMovie();
    },[])

    //console.log(movieList)

  return (
    <div>
      {movieList.map((movie)=>(
        // Listing the posters images
        <img alt='' src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        style={{width:"600px", height:"500px", margin:"5px"}}
        />
      ))}
    </div>
  )
}

export default Movie
