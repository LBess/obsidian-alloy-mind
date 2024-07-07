import axios from 'axios';

export const mockAxios = (get = jest.fn()) => {
    jest.spyOn(axios, 'get').mockImplementation(get);
    return get;
};
