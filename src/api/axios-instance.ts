import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Platform } from 'react-native';

const getBaseUrl = () => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

    if (Platform.OS === 'android' && baseUrl.includes('localhost')) {
        return baseUrl.replace('localhost', '10.0.2.2');
    }
    return baseUrl;
};

export const AXIOS_INSTANCE = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
    return AXIOS_INSTANCE(config).then((response: AxiosResponse<T>) => response.data);
};

export default customInstance;