import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import debounce from "lodash.debounce";

const MovieList = () => {
    const [movies, setMovies] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [genres, setGenres] = useState([]);
    const [visibleCount, setVisibleCount] = useState(50); // Load only 50 movies initially

    useEffect(() => {
        axios
            .get("https://raw.githubusercontent.com/prust/wikipedia-movie-data/master/movies.json")
            .then((response) => {
                setMovies(response.data);
                const allGenres = Array.from(new Set(response.data.flatMap((movie) => movie.genres)));
                setGenres(allGenres);
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    // Debounce search input
    const handleSearch = debounce((value) => {
        setSearch(value);
    }, 300);

    // Memoized filtered movies
    const filteredMovies = useMemo(() => {
        let filtered = movies;
        if (search) {
            filtered = filtered.filter((movie) => movie.title.toLowerCase().includes(search.toLowerCase()));
        }
        if (selectedGenres.length > 0) {
            filtered = filtered.filter((movie) => movie.genres.some((genre) => selectedGenres.includes(genre)));
        }
        return filtered;
    }, [search, selectedGenres, movies]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Movie List</h1>
            <div className="mb-4 flex gap-4">
                <input
                    type="text"
                    placeholder="Search by title..."
                    onChange={(e) => handleSearch(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                />
                <select
                    multiple
                    onChange={(e) => setSelectedGenres(Array.from(e.target.selectedOptions, (option) => option.value))}
                    className="p-2 border border-gray-300 rounded"
                >
                    {genres.map((genre) => (
                        <option key={genre} value={genre}>
                            {genre}
                        </option>
                    ))}
                </select>
            </div>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-gray-300 p-2">Title</th>
                        <th className="border border-gray-300 p-2">Year</th>
                        <th className="border border-gray-300 p-2">Cast</th>
                        <th className="border border-gray-300 p-2">Genres</th>
                        <th className="border border-gray-300 p-2">Thumbnail</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMovies.slice(0, visibleCount).map((movie) => (
                        <tr key={movie.title} className="odd:bg-white even:bg-gray-100">
                            <td className="border border-gray-300 p-2">{movie.title}</td>
                            <td className="border border-gray-300 p-2">{movie.year}</td>
                            <td className="border border-gray-300 p-2">{movie.cast?.join(", ") || "N/A"}</td>
                            <td className="border border-gray-300 p-2">{movie.genres.join(", ")}</td>
                            <td className="border border-gray-300 p-2 flex justify-center">
                                {movie.thumbnail ? (
                                    <img src={movie.thumbnail} alt={movie.title} className="w-12 h-12 object-cover" />
                                ) : (
                                    "No Image"
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredMovies.length > visibleCount && (
                <button
                    onClick={() => setVisibleCount((prev) => prev + 50)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Load More
                </button>
            )}
        </div>
    );
};

export default MovieList;
