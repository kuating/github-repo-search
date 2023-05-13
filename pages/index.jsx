import Head from 'next/head';
import styles from '../styles/Home.module.css';

import { useEffect, useState } from 'react';

export default function Home() {
  const [search, setSearch] = useState("")
  const [results, setResults] = useState([])
  const [page, setPage] = useState(1)
  const [perPage] = useState(8)

  async function fetchRepositories(url){
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.items.map((item) => ({
        id: item.id,
        name: item.name,
        owner: item.owner.login,
        stars: item.stargazers_count,
        forks: item.forks,
        last_update: item.updated_at,
        language: item.language,
        description:
        item.description!=null
          ? item.description.length > 500
            ? item.description.substring(0, 500) + "..."
            : item.description
          : "No description.",
        url: item.html_url,
      }));
    }
    catch(error) {
      console.log(error)
      return []
    }
    
  }
  
  function formatDate(dateString){
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  }

  async function searchRepositories(query,page,perPage) {
    console.log(query)
    const url = `https://api.github.com/search/repositories?q=${query}+in:name&sort=stars&order=desc&per_page=${perPage}&page=${page}`;
    const results = await fetchRepositories(url);
    return await results
  }

  async function handleSubmit(e){
    e.preventDefault()
    if(!search) return
    console.log(page)
    setResults(await searchRepositories(search,1,perPage))
    setPage(1)
    console.log(results)
  }

  async function handlePreviousPage(e){
    e.preventDefault()
    if(!search) return
    if(page > 1){
      setResults(await searchRepositories(search,page-1,perPage))
      setPage(page => { return page-1 })
    }
  }

  async function handleNextPage(e){
    e.preventDefault()
    if(!search) return
    const pageResults = await searchRepositories(search,page+1,perPage)
    if(pageResults != []){
      setResults(pageResults)
      setPage(page => { return page+1 })
    }
    console.log(results)
    
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Github Repo Search</title>
        <link rel="icon" href="/github-logo.ico" />
      </Head>

      <main>
        <h1 className={styles.title}>
          Search on <a href="https://github.com">GitHub!</a>
        </h1>

        <p className={styles.description}>
          You can look for a GitHub repository, but beware, only a few requests per minute!
        </p>
        <form onSubmit={handleSubmit} className="new-search-form">
          <div className="form row">
            <input
            className={styles.input}
            value={search}
            onChange={e => setSearch(e.target.value)}
            type="text"
            id="item"
            placeholder="Search.." />
          </div>
        </form>
        <br/><br/>
        <h1 className={styles.resultslabel}>Results</h1>
        <span className={styles.pagebar}>
          <button onClick={handlePreviousPage}>&lt;</button>
          <span className={styles.owner}> {page} </span>
          <button onClick={handleNextPage}>&gt;</button>
        </span>
        <div className={styles.grid}>
          {results.map(repository => {
            return (
              <a key={repository.id} href={repository.url} className={styles.card}>
              <p className={styles.owner}>{repository.owner}/</p>
              <h3>{repository.name} &rarr;</h3>
              <p className={styles.stars}>{repository.stars} stars</p>
              <br/>
              <p className={styles.line2}>{repository.forks} forks</p>
              <p className={styles.line2}>{repository.language}</p>
              <br/>
              <p>{repository.description}</p>
              <br/>
              <p className={styles.line3}>Last updated on {formatDate(repository.last_update)}</p>
            </a>
            )
          })}
        </div>
      </main>

      <footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel" className={styles.logo} />
        </a>
      </footer>

      <style jsx>{`
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        footer img {
          margin-left: 0.5rem;
        }
        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }
        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}