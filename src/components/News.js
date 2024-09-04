import React, {useState, useEffect} from 'react'

function News() {
    const [newsList, setnewsList] = useState([])

    const getMovie = () => {
        fetch("https://api.themoviedb.org/3/discover/movie?api_key=e6f982ddd401b7a5a7a7184e6df5f48d")
        .then(res => res.json())
        .then(json => setnewsList(json.results))
    }

    useEffect(()=> {
        getMovie();
    },[])

    console.log(newsList)

  return (
    <div>
      {
      /*
        newsList.map((news) =>(
            <img/>
        ))
      */
      }
    </div>
  )
}

export default News
