import { Client, TablesDB, Query, ID } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;

const client = new Client()
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const tableDB = new TablesDB(client);

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    // 1. To check if serachTerm exists in db
    const result = await tableDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.equal("searchTerm", searchTerm)],
    });

    // 2. If it does, update the count
    if (result?.rows?.length > 0) {
      const doc = result?.rows[0];
      await tableDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: doc.$id,
        data: {
          count: doc.count + 1,
        },
      });
    }
    // 3. If it doesn't create a new row with count 1
    else {
      await tableDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: ID.unique(),
        data: {
          searchTerm,
          count: 1,
          movie_id: movie.id,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export const getTrendingMovies = async () => {
  try {
    const result = await tableDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.limit(5), Query.orderDesc("count")],
    });
    return result.rows;
  } catch (error) {
    console.error(error);
  }
};
