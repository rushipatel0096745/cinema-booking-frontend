import { api } from "./axiosInstance";
import type { Movie, MovieShowtimesResponse } from "../types";

interface ApiMoviesResponse {
    success: boolean;
    data: {
        movies: Movie[];
    };
}

export const movieListApi = async (city?: string, date?: string) => {
    const res = await api.get<ApiMoviesResponse>("/api/movies", {
        params: {
            city,
            date,
        },
    });

    return res.data.data;
};

interface ApiMovieDetailResponse {
    success: boolean;
    data: {
        movie: Movie;
    };
}

export const getMovieDetailsApi = async (id: string) => {
    const res = await api.get<ApiMovieDetailResponse>(`/api/movies/${id}`);
    return res.data.data;
};

interface ApiMovieShowtimesResponse {
    success: boolean;
    data: MovieShowtimesResponse;
}
export const getMovieShowtimesApi = async (movieId: string, city?: string, date?: string) => {
    const res = await api.get<ApiMovieShowtimesResponse>(`/api/movies/${movieId}/showtimes`, {
        params: {
            city,
            date,
        },
    });
    return res.data.data;
};
