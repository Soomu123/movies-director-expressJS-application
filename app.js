const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = (__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// get the list of all the movies in the database (movies table)
// API 1

const convertMovieDbAPI1 = (eachMovieObj) => {
  return {
    movieName: eachMovieObj.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
     SELECT movie_name FROM movie;
    `;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovieObj) => convertMovieDbAPI1(eachMovieObj))
  );
});

//API 2
// create a movie in movies table in moviesData.db

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
     INSERT INTO 
     movie(director_id,movie_name,lead_actor)
     VALUES(
     ${directorId},
     "${movieName}",
     "${leadActor}"
     );
    `;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3
//Returns a movie based on the movie ID

const convertMovieDbAPI3 = (eachMovieObj) => {
  return {
    movieId: eachMovieObj.movie_id,
    directorId: eachMovieObj.director_id,
    movieName: eachMovieObj.movie_name,
    leadActor: eachMovieObj.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
     SELECT * FROM movie where movie_id = ${movieId};
    `;
  const eachMovieObj = await db.get(getMovieQuery);
  response.send(convertMovieDbAPI3(eachMovieObj));
});

//API 4
//Updates the details of a movie in the movie table based on the movie ID

app.put("/movies/:movieId/", (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
    UPDATE movie 
    SET 
    director_id = ${directorId},
    movie_name = "${movieName}",
    lead_actor = "${leadActor}"  
    where movie_id = ${movieId}   
   `;
  db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5
//Deletes a movie from the movie table based on the movie ID

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId}
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6
//Returns a list of all directors in the director table

const convertDirectorDbAPI6 = (eachObj) => {
  return {
    directorId: eachObj.director_id,
    directorName: eachObj.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
     SELECT * FROM director
    `;
  const directorArray = await db.all(getDirectorQuery);
  response.send(directorArray.map((eachObj) => convertDirectorDbAPI6(eachObj)));
});
//API 7
//Returns a list of all movie names directed by a specific director

app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesByDirectorId = `
     SELECT movie_name as movieName  FROM movie 
     WHERE director_id = ${directorId};
   `;
  const movieTable = await db.all(getMoviesByDirectorId);
  response.send(movieTable);
});
module.exports = app;
