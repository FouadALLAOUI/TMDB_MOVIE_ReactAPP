import React, {useState, useEffect} from 'react'

function News() {
    const [newsList, setnewsList] = useState([])

    const getMovie = () => {
        fetch("http://api.mediastack.com/v1/news?access_key=72476354d30be85a28844ec5abe47d5c")
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
